import os
import json
import re
import copy
from subprocess import CalledProcessError
from subprocess import PIPE
from subprocess import Popen

import google.protobuf.json_format as json_format
import google.protobuf.text_format as text_format

from .proto.model_config.protxt_pb2 import ModelConfig


def pbtxt2json(content: str):
  '''
  Convert protocol messages in text format to json format string.
  '''
  message = text_format.Parse(content, ModelConfig())
  json_string = json_format.MessageToJson(message)
  return json_string


def json2pbtxt(content: str):
  '''
  Convert json format string to protocol messages in text format.
  '''
  message = json_format.Parse(content, ModelConfig())
  text_proto = text_format.MessageToString(message)
  return text_proto

def analyse_config(cur_dir:str):
  '''
  Analyse the model config in specified directory.
  Return a json object to describe configuration.
  '''
  all_model_configs = {}
  all_model_paths = {}
  all_model_versions = {}
  parent_dir, sub_dirs, filenames = os.walk(cur_dir).send(None)  # models can only put directory in model repository, 
                                                                #so we should only search depth 1 directories.
  for model_dir_name in sub_dirs:
    model_dir, model_sub_dirs, filenames = os.walk(os.path.join(parent_dir, model_dir_name)).send(None)
    model_name = os.path.basename(model_dir)
    for filename in filenames:
      if '.pbtxt' in filename:
        all_model_paths[model_name] = model_dir  # store model path
        json_config = json.loads(pbtxt2json(open(os.path.join(model_dir, filename)).read()))
        all_model_configs[model_name] = json_config    # store original config file content in json format
    for model_sub_dir in model_sub_dirs:
      if re.match('\d+', model_sub_dir): # version directory consists of numbers
        for version_resource_file in os.listdir(os.path.join(model_dir, model_sub_dir)):
          if model_name not in all_model_versions:
            all_model_versions[model_name] = {}
          if model_sub_dir not in all_model_versions[model_name]:
            all_model_versions[model_name][model_sub_dir] = []
          all_model_versions[model_name][model_sub_dir].append(version_resource_file)

def exchange_format_to_original_format(exchange_format):
  '''
  Change config exchange format to original format.
  '''
  ensembles = []
  models = []
  all_models = {}
  if 'ensembles' in exchange_format:
    emsembles = exchange_format['ensembles']
  if 'models' in exchange_format:
    models = exchange_format['models']
  alls = ensembles + models
  for model_config in alls:
    # 1. add 'execution_accelerators' keyword
    if 'optimization' in model_config:
      optimization_config = model_config['optimization']
      del model_config['optimization']
      model_config['optimization'] = {}
      model_config['optimization']['execution_accelerators'] = optimization_config
    # 2. put parameters in 'cpu_execution_accelerator' and 'gpu_execution_accelerator' inside 'parameters' keyword
    for accelerator_name, accelerator_items in optimization_config.items():
      reversed_accelerator_items = []
      for accelerator_item in accelerator_items:
        transformed_accelerator_item = {}
        for key, value in accelerator_item.items():
          if key == 'name':
            transformed_accelerator_item[key] = value
          else:
            if 'parameters' not in transformed_accelerator_item:
              transformed_accelerator_item['parameters'] = {}
            transformed_accelerator_item['parameters'][key] = value
        reversed_accelerator_items.append(transformed_accelerator_item)
      del optimization_config[accelerator_name]
      optimization_config[accelerator_name] = reversed_accelerator_items
        
    # 3. delete versions information
    if 'versions' in model_config:
      del model_config['versions']
    if 'platform' in model_config and model_config['platform'] == 'ensemble':  # emsemble model
      # 4. add 'ensembleScheduling' keyword
      if 'step' in model_config:
        step_configs = model_config['step']
        if 'ensembleScheduling'  not in model_config:
          model_config['ensembleScheduling'] = {}
        model_config['ensembleScheduling']['step'] = step_configs
        del model_config['step']
        # 5. remove two virtual models(feed, fetch), and "modelType", "inputModels", "outputModels", "inputVars", "outputVars"
        remove_list = []
        for model_config_in_step in step_configs:
            if model_config_in_step['modelName'] == 'feed' or model_config_in_step['modelName'] == 'fetch':
              remove_list.append(model_config_in_step)
              continue
            del model_config_in_step['modelType']
            del model_config_in_step['inputModels']
            del model_config_in_step['outputModels']
            del model_config_in_step['inputVars']
            del model_config_in_step['outputVars']
    all_models['name'] = model_config
  return all_models
    

def original_format_to_exchange_format(original_format, version_info):
  '''
  Change config original format to exchange format.
  '''
  exchange_format = {}
  exchange_format['ensembles'] = []
  exchange_format['models'] = []
  for model_name, model_config in original_format.items():
    # 1. remove 'execution_accelerators' keyword
    # 2. put parameters in 'cpu_execution_accelerator' and 'gpu_execution_accelerator' outside
    transformed_config = copy.deepcopy(model_config)
    if 'optimization' in model_config:
      if 'execution_accelerators' in model_config['optimization']:
        transformed_optimization_config = {}
        for accelerator_name, accelerator_items in model_config['optimization']['execution_accelerators'].items():
          transformed_optimization_config[accelerator_name] = []
          for accelerator_item in accelerator_items:
            transformed_accelerator_item = {}
            for key, value in accelerator_item.items():
              if key == 'parameters':
                for parameter_name, parameter_value in value.items():
                  transformed_accelerator_item[parameter_name] = parameter_value
              else:
                  transformed_accelerator_item[key] = value
            transformed_optimization_config[accelerator_name].append(transformed_accelerator_item)
        del transformed_config['optimization']
        transformed_config['optimization'] = transformed_optimization_config
    # 3. add versions information
    if model_name in version_info:
      transformed_config[model_name]['versions'] = version_info[model_name]
    if 'platform' in model_config and model_config['platform'] == 'ensemble':  # emsemble model 
      # 4. remove ensembleScheduling
      if 'ensembleScheduling' in model_config:
        if 'step' in model_config['ensembleScheduling']:
          del transformed_config['ensembleScheduling']
          transformed_config['step'] = model_config['ensembleScheduling']['step']
          # 5. add two virtual models(feed, fetch), and "modelType", "inputModels", "outputModels", "inputVars", "outputVars"
          for model_config_in_step in transformed_config['step']:
            model_config_in_step['modelType'] = 'normal'
            model_config_in_step['inputModels'] = []
            model_config_in_step['outputModels'] = []
            model_config_in_step['inputVars'] = []
            model_config_in_step['outputVars'] = []

          transformed_config['step'].append({
            "modelName": "feed",
            "modelType": "virtual",
            "inputModels": [],
            "outputModels": [],
            "inputVars": [],
            "outputVars": []
             })
          transformed_config['step'].append({
            "modelName": "fetch",
            "modelType": "virtual",
            "inputModels": [],
            "outputModels": [],
            "inputVars": [],
            "outputVars": []
             })
          analyse_step_relationships(transformed_config['step'], transformed_config['input'], transformed_config['output'])
          exchange_format['ensembles'].append(transformed_config)
    elif 'backend' in model_config:  # single model
      exchange_format['models'].append(transformed_config)
  return exchange_format

def analyse_step_relationships(step_config, inputs, outputs):
  '''
  Analyse model relationships in ensemble step. And fill  "inputModels", "outputModels", "inputVars", "outputVars" in step_config.
  step_config: step data in ensemble model config.
  inputs: inputs in ensemble model config.
  outputs: outputs in ensemble model config.
  '''
  models_dict = {}
  vars_dict = {}
  for model_config_in_step in step_config:
    models_dict[model_config_in_step['modelName']] = model_config_in_step
    if model_config_in_step['modelType'] == 'virtual':
      for var in inputs:
        if var['name'] not in vars_dict:
          vars_dict[var['name']] = {}
          vars_dict[var['name']]['from_models'] = []
          vars_dict[var['name']]['to_models'] = []
        vars_dict[var['name']]['from_models'].append('feed')
      for var in outputs:
        if var['name'] not in vars_dict:
          vars_dict[var['name']] = {}
          vars_dict[var['name']]['from_models'] = []
          vars_dict[var['name']]['to_models'] = []
        vars_dict[var['name']]['to_models'].append('fetch')
    else:
      for var_placehold_name, var_name in model_config_in_step['inputMap'].items():
        if var_name not in vars_dict:
          vars_dict[var_name] = {}
          vars_dict[var_name]['from_models'] = []
          vars_dict[var_name]['to_models'] = []
        vars_dict[var_name]['to_models'].append(model_config_in_step['modelName'])
        
      for var_placehold_name, var_name in model_config_in_step['outputMap'].items():
        if var_name not in vars_dict:
          vars_dict[var_name] = {}
          vars_dict[var_name]['from_models'] = []
          vars_dict[var_name]['to_models'] = []
        vars_dict[var_name]['from_models'].append(model_config_in_step['modelName'])
  for var_name, relationships in vars_dict.items():
    for from_model in relationships['from_models']:
      models_dict[from_model]['outputVars'].append(var_name)
      models_dict[from_model]['outputModels'].extend(relationships['to_models'])
    for to_model in relationships['to_models']:
      models_dict[to_model]['inputVars'].append(var_name)
      models_dict[to_model]['inputModels'].extend(relationships['from_models'])



def launch_process(kwargs: dict):
  '''
  Launch a fastdeploy server according to specified arguments.
  '''
  cmd = ['fastdeployserver']
  for key, value in kwargs.items():
      cmd.append('--{}'.format(key))
      cmd.append('{}'.foramt(value))
  p = Popen(cmd, stdout=PIPE, bufsize=1, universal_newlines=True)
  return p


def get_process_output(process):
  '''
  Get the standard output of a opened subprocess.
  '''
  for line in process.stdout:
      yield line


def kill_process(process):
  '''
  Stop a opened subprocess.
  '''
  process.kill()
