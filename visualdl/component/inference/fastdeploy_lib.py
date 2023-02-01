# Copyright (c) 2022 VisualDL Authors. All Rights Reserve.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# =======================================================================
import copy
import json
import os
import random
import re
import signal
import string
from collections import defaultdict
from subprocess import Popen
from subprocess import STDOUT

import google.protobuf.json_format as json_format
import google.protobuf.text_format as text_format
import psutil
import requests

from .proto.model_config_pb2 import ModelConfig
from visualdl.utils.dir import FASTDEPLOYSERVER_PATH


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


def validate_data(model_config):
    '''
    Validate data in model config, we should check empty value recieved from front end.
    The easiest way to handle it is to drop empty value.
    Args:
        model_config: model config to be saved in config file
    Return:
        model config after filtering.
    '''
    model_config_filtered = {}
    for key, value in model_config.items():
        if value:
            model_config_filtered[key] = value
    return model_config_filtered


def analyse_config(cur_dir: str):
    '''
  Analyse the model config in specified directory.
  Return a json object to describe configuration.
  '''
    all_model_configs = {}
    all_model_versions = {}
    parent_dir, sub_dirs, filenames = os.walk(cur_dir).send(
        None)  # models can only put directory in model repository,
    # so we should only search depth 1 directories.
    for model_dir_name in sub_dirs:
        model_dir, model_sub_dirs, filenames = os.walk(
            os.path.join(parent_dir, model_dir_name)).send(None)
        model_name = os.path.basename(model_dir)
        config_filenames = []
        for filename in filenames:
            if '.pbtxt' in filename:
                config_filenames.append(
                    filename
                )  # filenames with extension .pbtxt are all config files
        if config_filenames:
            default_config_filename = config_filenames[0]
            if 'config.pbtxt' in config_filenames:
                default_config_filename = 'config.pbtxt'
                config_filenames.remove(default_config_filename)
                config_filenames.insert(0, default_config_filename)
            else:
                # if no config.pbtxt, we choose the first file in config_filenames list to create config.pbtxt
                copy_config_file_to_default_config(model_dir,
                                                   default_config_filename)
                default_config_filename = 'config.pbtxt'
                config_filenames.insert(0, default_config_filename)
            json_config = json.loads(
                pbtxt2json(
                    open(os.path.join(model_dir,
                                      default_config_filename)).read()))
            json_config["config_filenames"] = config_filenames[
                0]  # add config_filenames to config data (frontend developer said he only wanted one filename,
            # and to request config_filenames by get_config_filenames_for_one_model later)
            all_model_configs[
                model_name] = json_config  # store original config file content in json format
            json_config[
                'name'] = model_name  # because name in config data may be different from model_name,
            # model_name is model directory name actually, we should conform name with model_name.
        else:
            continue
        for model_sub_dir in model_sub_dirs:
            if re.match(
                    r'\d+',
                    model_sub_dir):  # version directory consists of numbers
                if model_name not in all_model_versions:
                    all_model_versions[model_name] = {}
                if model_sub_dir not in all_model_versions[model_name]:
                    all_model_versions[model_name][model_sub_dir] = []
                for version_resource_file in os.listdir(
                        os.path.join(model_dir, model_sub_dir)):
                    all_model_versions[model_name][model_sub_dir].append(
                        version_resource_file)
        if model_name not in all_model_versions:  # if a model has config but no version directory,
            # to convenient users, we create one
            all_model_versions[model_name] = {}
            os.mkdir(os.path.join(model_dir, '1'))
            all_model_versions[model_name]['1'] = []

    if not all_model_configs:
        raise Exception(
            'The path you choose is not a valid model repository, please choose a valid path.'
        )
    return all_model_configs, all_model_versions


def exchange_format_to_original_format(exchange_format):
    '''
  Change config exchange format to original format.
  '''
    ensembles = []
    models = []
    all_models = {}
    if 'ensembles' in exchange_format:
        ensembles = exchange_format['ensembles']
    if 'models' in exchange_format:
        models = exchange_format['models']
    alls = ensembles + models
    for model_config in alls:
        # 1. add 'executionAccelerators' keyword
        if 'optimization' in model_config:
            optimization_config = model_config['optimization']
            del model_config['optimization']
            model_config['optimization'] = {}
            model_config['optimization'][
                'executionAccelerators'] = optimization_config
        # 2. delete versions information
        if 'versions' in model_config:
            del model_config['versions']
        if 'config_filenames' in model_config:
            del model_config['config_filenames']
        if 'platform' in model_config and model_config[
                'platform'] == 'ensemble':  # emsemble model
            # 3. add 'ensembleScheduling' keyword
            if 'step' in model_config:
                step_configs = model_config['step']
                if 'ensembleScheduling' not in model_config:
                    model_config['ensembleScheduling'] = {}
                model_config['ensembleScheduling']['step'] = step_configs
                del model_config['step']
                # 4. remove two virtual models(feed, fetch), and
                #  "modelType", "inputModels", "outputModels", "inputVars", "outputVars"
                remove_list = []
                for model_config_in_step in step_configs:
                    if model_config_in_step[
                            'modelName'] == 'feed' or model_config_in_step[
                                'modelName'] == 'fetch':
                        remove_list.append(model_config_in_step)
                        continue
                    del model_config_in_step['modelType']
                    del model_config_in_step['inputModels']
                    del model_config_in_step['outputModels']
                    del model_config_in_step['inputVars']
                    del model_config_in_step['outputVars']
                for remove_item in remove_list:
                    step_configs.remove(remove_item)
        all_models[model_config['name']] = model_config
    return all_models


def copy_config_file_to_default_config(model_dir, config_name):
    json_config = json.loads(
        pbtxt2json(open(os.path.join(model_dir, config_name)).read()))
    model_name = os.path.basename(model_dir)
    json_config['name'] = model_name
    text_proto = json2pbtxt(json.dumps(json_config))
    with open(os.path.join(model_dir, 'config.pbtxt'), 'w') as f:
        f.write(text_proto)


def original_format_to_exchange_format(original_format, version_info):
    '''
  Change config original format to exchange format.
  '''
    exchange_format = {}
    exchange_format['ensembles'] = []
    exchange_format['models'] = []
    # 0. transform version info into component format in frontend
    for model_name, version_filenames_dict in version_info.items():
        version_info_for_frontend = []
        for version_name, filenames in version_filenames_dict.items():
            version_filenames_dict_for_frontend = {}
            version_filenames_dict_for_frontend['title'] = version_name
            version_filenames_dict_for_frontend['key'] = version_name
            version_filenames_dict_for_frontend['children'] = []
            for filename in filenames:
                version_filenames_dict_for_frontend['children'].append({
                    'title':
                    filename,
                    'key':
                    filename
                })
            version_info_for_frontend.append(
                version_filenames_dict_for_frontend)
        version_info[model_name] = version_info_for_frontend

    for model_name, model_config in original_format.items():
        # 1. remove 'executionAccelerators' keyword
        transformed_config = copy.deepcopy(model_config)
        if 'optimization' in model_config:
            if 'executionAccelerators' in model_config['optimization']:
                transformed_optimization_config = model_config['optimization'][
                    'executionAccelerators']
                del transformed_config['optimization']
                transformed_config[
                    'optimization'] = transformed_optimization_config
        # 2. add versions information
        if model_name in version_info:
            transformed_config['versions'] = version_info[model_name]
        if 'platform' in model_config and model_config[
                'platform'] == 'ensemble':  # emsemble model
            # 3. remove ensembleScheduling
            if 'ensembleScheduling' in model_config:
                if 'step' in model_config['ensembleScheduling']:
                    del transformed_config['ensembleScheduling']
                    transformed_config['step'] = model_config[
                        'ensembleScheduling']['step']
                    # 4. add two virtual models(feed, fetch), and
                    # "modelType", "inputModels", "outputModels", "inputVars", "outputVars"
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
                    analyse_step_relationships(transformed_config['step'],
                                               transformed_config['input'],
                                               transformed_config['output'])
                    exchange_format['ensembles'].append(transformed_config)
        elif 'backend' in model_config:  # single model
            exchange_format['models'].append(transformed_config)
    return exchange_format


def analyse_step_relationships(step_config, inputs, outputs):  # noqa: C901
    '''
  Analyse model relationships in ensemble step. And fill  \
    "inputModels", "outputModels", "inputVars", "outputVars" in step_config.
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
                    vars_dict[var['name']]['from_models'] = set()
                    vars_dict[var['name']]['to_models'] = set()
                vars_dict[var['name']]['from_models'].add('feed')
            for var in outputs:
                if var['name'] not in vars_dict:
                    vars_dict[var['name']] = {}
                    vars_dict[var['name']]['from_models'] = set()
                    vars_dict[var['name']]['to_models'] = set()
                vars_dict[var['name']]['to_models'].add('fetch')
        else:
            for var_placehold_name, var_name in model_config_in_step[
                    'inputMap'].items():
                if var_name not in vars_dict:
                    vars_dict[var_name] = {}
                    vars_dict[var_name]['from_models'] = set()
                    vars_dict[var_name]['to_models'] = set()
                vars_dict[var_name]['to_models'].add(
                    model_config_in_step['modelName'])

            for var_placehold_name, var_name in model_config_in_step[
                    'outputMap'].items():
                if var_name not in vars_dict:
                    vars_dict[var_name] = {}
                    vars_dict[var_name]['from_models'] = set()
                    vars_dict[var_name]['to_models'] = set()
                vars_dict[var_name]['from_models'].add(
                    model_config_in_step['modelName'])
    for var_name, relationships in vars_dict.items():
        for from_model in relationships['from_models']:
            models_dict[from_model]['outputVars'].append(var_name)
            for var_to_model in relationships['to_models']:
                if var_to_model not in models_dict[from_model]['outputModels']:
                    models_dict[from_model]['outputModels'].append(
                        var_to_model)
        for to_model in relationships['to_models']:
            models_dict[to_model]['inputVars'].append(var_name)
            for var_from_model in relationships['from_models']:
                if var_from_model not in models_dict[to_model]['inputModels']:
                    models_dict[to_model]['inputModels'].append(var_from_model)
    calculate_layout_for_frontend(models_dict)


def get_config_filenames_for_one_model(cur_dir, name):
    _, _, filenames = os.walk(os.path.join(cur_dir, name)).send(None)
    config_filenames = []
    backup_config_filenames = []
    for filename in filenames:
        if '.pbtxt' in filename and 'vdlbackup' not in filename:
            config_filenames.append(
                filename
            )  # filenames with extension .pbtxt and not contain 'vdlbackup' are normal config files
        elif '.pbtxt' in filename and 'vdlbackup' in filename:
            backup_config_filenames.append(
                filename
            )  # filenames with extension .pbtxt and  contain 'vdlbackup' are backup config files
    config_filenames = sorted(config_filenames) + sorted(
        backup_config_filenames)
    return config_filenames


def get_config_for_one_model(cur_dir, name, config_filename):
    all_model_configs = {}
    all_model_versions = {}
    filename = os.path.join(cur_dir, name, config_filename)
    json_config = json.loads(pbtxt2json(open(filename).read()))
    json_config[
        'name'] = name  # because name in config data may be different from model_name,
    # model_name is model directory name actually, we should conform name with model_name.
    json_config["config_filenames"] = config_filename
    all_model_configs[
        name] = json_config  # store original config file content in json format
    all_model_versions[name] = {}
    for model_sub_dir in os.listdir(os.path.join(cur_dir, name)):
        if re.match(r'\d+',
                    model_sub_dir):  # version directory consists of numbers
            if model_sub_dir not in all_model_versions[name]:
                all_model_versions[name][model_sub_dir] = []
            for version_resource_file in os.listdir(
                    os.path.join(cur_dir, name, model_sub_dir)):
                all_model_versions[name][model_sub_dir].append(
                    version_resource_file)
    model_config = original_format_to_exchange_format(all_model_configs,
                                                      all_model_versions)
    if model_config['ensembles']:
        return model_config['ensembles'][0]
    elif model_config['models']:
        return model_config['models'][0]


def calculate_layout_for_frontend(model_config_in_step):
    '''
    Analyse model topology connections and prepare the positions for each model in layout.
    Dynamic program algorithm:
        depth(cur_node) = max([depth(prev_node) for prev_node in cur_node['inputModels']])
    Args:
        model_config_in_step(dict): model config in ensemble models' step, indexed by model name.
    Returns:
        None. Results calculated will be saved in place.
    '''
    path_depth = defaultdict(int)

    def depth_recursive(model):
        if model['modelName'] == 'feed':
            path_depth[model['modelName']] = 0
            return 0
        if path_depth[model['modelName']] != 0:
            return path_depth[model['modelName']]
        path_depth[model['modelName']] = max([
            depth_recursive(model_config_in_step[model_name]) for model_name in
            model_config_in_step[model['modelName']]['inputModels']
        ]) + 1
        return path_depth[model['modelName']]

    depth_recursive(model_config_in_step['fetch'])
    path_depth_tuple = [
        (k, v)
        for k, v in sorted(path_depth.items(), key=lambda item: item[1])
    ]
    cur_x = 0
    last_depth = -1
    for model_name, depth in path_depth_tuple:
        if depth == last_depth:
            model_config_in_step[model_name]['pos_y'] = depth
            model_config_in_step[model_name]['pos_x'] = cur_x
            cur_x += 1
        else:
            cur_x = 0
            model_config_in_step[model_name]['pos_y'] = depth
            model_config_in_step[model_name]['pos_x'] = cur_x
            cur_x += 1
        last_depth = depth
    return


def launch_process(kwargs: dict):
    '''
  Launch a fastdeploy server according to specified arguments.
  '''
    cmd = ['fastdeployserver']
    launch_env = os.environ.copy()
    start_args = {}
    for key, value in kwargs.items():
        if key == 'default_model_name':  # Used to fill client model_name automatically
            start_args[key] = value
            continue
        if key == 'server-name' or key == 'ensemble-img':  # extra information
            start_args[key] = value
            continue
        if key == 'gpus':
            if value:
                launch_env['CUDA_VISIBLE_DEVICES'] = value
                start_args[key] = value
            continue
        cmd.append('--{}'.format(key))
        cmd.append('{}'.format(value))
        start_args[key] = value
    if start_args['server-name'] and start_args['server-name'] in os.listdir(
            FASTDEPLOYSERVER_PATH):
        raise RuntimeError(
            "Failed to launch server，server name {} has been used，please write a different server name."
            .format(start_args['server-name']))
    all_model_configs, all_model_versions = analyse_config(
        start_args['model-repository'])
    model_repo_config = original_format_to_exchange_format(
        all_model_configs, all_model_versions)
    model_repo_config['ensemble-img'] = start_args['ensemble-img']
    logfilename = 'logfile-{}'.format(get_random_string(8))
    while os.path.exists(os.path.join(FASTDEPLOYSERVER_PATH, logfilename)):
        logfilename = 'logfile-{}'.format(get_random_string(8))
    try:
        p = Popen(
            cmd,
            stdout=open(
                os.path.join(FASTDEPLOYSERVER_PATH, logfilename),
                'w',
                buffering=1),
            stderr=STDOUT,
            universal_newlines=True,
            env=launch_env)
    except Exception:
        raise RuntimeError(
            "Failed to launch fastdeployserver，please check fastdeployserver is installed in environment."
        )
    server_name = start_args['server-name'] if start_args[
        'server-name'] else p.pid
    with open(
            os.path.join(FASTDEPLOYSERVER_PATH, '{}'.format(server_name)),
            'w') as f:
        # filename ${server_name} contain 4 lines:
        # line1 : the real log filename ${logfilename}
        # line2 : pid
        # line3 : launch arguments
        # line4 : model-repository configuration
        f.write(logfilename + '\n' + str(p.pid) + '\n' +
                json.dumps(start_args) + '\n' + json.dumps(model_repo_config))
    return p


def get_random_string(length):
    # choose from all lowercase letter
    letters = string.ascii_lowercase
    result_str = ''.join([random.choice(letters) for i in range(length)])
    return result_str


def get_start_arguments(server_id):
    '''
    Get the start arguments for fastdeployserver process.
    Args:
        server_id(str): fastdeployserver process name
    Returns:
        args(dict): launch arguments when start fastdeployserver process.
    '''
    args = {}
    if os.path.exists(
            os.path.join(FASTDEPLOYSERVER_PATH, '{}'.format(server_id))):
        with open(
                os.path.join(FASTDEPLOYSERVER_PATH, '{}'.format(server_id)),
                'r') as f:
            arguments_json = f.read().split('\n')[2]
            args = json.loads(arguments_json)
    return args


def get_process_pid(server_id):
    '''
    Get the process id for fastdeployserver process.
    Args:
        server_id(str): fastdeployserver process name
    Returns:
        pid(int): process id.
    '''
    pid = None
    if os.path.exists(
            os.path.join(FASTDEPLOYSERVER_PATH, '{}'.format(server_id))):
        with open(
                os.path.join(FASTDEPLOYSERVER_PATH, '{}'.format(server_id)),
                'r') as f:
            pid = int(f.read().split('\n')[1])
    return pid


def get_process_logfile_name(server_id):
    '''
    Get the process logfile name for fastdeployserver process.
    Args:
        server_id(str): fastdeployserver process name
    Returns:
        logfile(str): logfile name.
    '''
    filename = None
    if os.path.exists(
            os.path.join(FASTDEPLOYSERVER_PATH, '{}'.format(server_id))):
        with open(
                os.path.join(FASTDEPLOYSERVER_PATH, '{}'.format(server_id)),
                'r') as f:
            filename = f.read().split('\n')[0]
    return filename


def get_process_model_configuration(server_id):
    '''
    Get the model repository configuration for fastdeployserver process.
    Args:
        server_id(str): fastdeployserver process name
    Returns:
        configuration(dict): model repository configuration
    '''
    conf = {}
    if os.path.exists(
            os.path.join(FASTDEPLOYSERVER_PATH, '{}'.format(server_id))):
        with open(
                os.path.join(FASTDEPLOYSERVER_PATH, '{}'.format(server_id)),
                'r') as f:
            conf_json = f.read().split('\n')[3]
            conf = json.loads(conf_json)
    return conf


def get_process_output(server_id, length):
    '''
  Get the standard output of a opened subprocess.
  '''
    if os.path.exists(
            os.path.join(FASTDEPLOYSERVER_PATH, '{}'.format(server_id))):
        logfilename = get_process_logfile_name(server_id)
        # delete file ${logfilename} if exists
        if os.path.exists(
                os.path.join(FASTDEPLOYSERVER_PATH, '{}'.format(logfilename))):
            with open(
                    os.path.join(FASTDEPLOYSERVER_PATH,
                                 '{}'.format(logfilename)), 'r') as f:
                f.seek(length)
                data = f.read()
                return data


def mark_pid_for_dead_process(server_id):
    '''
    Resource files for a dead server only deleted when user closes the server in frontend.
    When user close the server, pid recorded in logfile will be killed.
    In case a dead process id is reassigned for a new process, we should mark the pid recorded in logfile as outdated.
    Here, we choose to replace the pid to -1 in logfile to denote the zombie process \
        which has been polled and becomes dead.
    Args:
        server_id(str): fastdeployserver process name
    '''
    if os.path.exists(
            os.path.join(FASTDEPLOYSERVER_PATH, '{}'.format(server_id))):
        with open(
                os.path.join(FASTDEPLOYSERVER_PATH, '{}'.format(server_id)),
                'r') as f:
            contents = f.read().split('\n')
        contents[1] = '-1'  # we replace pid to -1
        with open(
                os.path.join(FASTDEPLOYSERVER_PATH, '{}'.format(server_id)),
                'w') as f:
            f.write('\n'.join(contents))


def delete_files_for_process(server_id):
    '''
    Delete logfile for fastdeployserver process.
    Args:
        server_id(str): fastdeployserver process name
    '''
    if os.path.exists(
            os.path.join(FASTDEPLOYSERVER_PATH, '{}'.format(server_id))):
        logfilename = get_process_logfile_name(server_id)
        # delete file ${logfilename} if exists
        if os.path.exists(
                os.path.join(FASTDEPLOYSERVER_PATH, '{}'.format(logfilename))):
            os.remove(
                os.path.join(FASTDEPLOYSERVER_PATH, '{}'.format(logfilename)))
        os.remove(os.path.join(FASTDEPLOYSERVER_PATH, '{}'.format(server_id)))


def kill_process(process):
    '''
  Stop a opened subprocess.
  '''
    if type(process) == str:  # server_id, use os.kill to terminate
        pid = get_process_pid(process)
        if pid == -1:  # we use -1 to mark dead process
            return
        try:
            os.kill(pid, signal.SIGKILL)
        except Exception:
            pass
    else:
        pid = process.pid
        process.kill()
        try:
            process.wait(10)
        except Exception:
            pass


def get_alive_fastdeploy_servers():
    '''
    Search server names in `FASTDEPLOYSERVER_PATH`, if process is dead and log still exists due to \
        some unexpectable reasons, delete log file.
    '''
    server_names = [
        name for name in os.listdir(FASTDEPLOYSERVER_PATH)
        if 'logfile' not in name
    ]
    should_delete_servers = []
    for server_name in server_names:
        if check_process_alive(server_name) is False:
            delete_files_for_process(server_name)
            should_delete_servers.append(server_name)
    for server_name in should_delete_servers:
        server_names.remove(server_name)
    return server_names


def check_process_zombie(server_id):
    '''
    Given a server id, check whether the process became zoombie and mark pid as -1.
    Args:
        server_id(str): fastdeployserver process name
    Return:
        status(bool): True if process became zoombie.
    '''
    pid = get_process_pid(server_id)
    if pid == -1:
        return True
    else:
        return False


def check_process_alive(server_id):
    '''
    Given a server id, check whether the process is alive or not.
    Args:
        server_id(str): fastdeployserver process name
    Return:
        status(bool): True if process is still alive.
    '''
    pid = get_process_pid(server_id)
    if pid is None:
        return False
    if pid == -1:  # We use -1 to mark zombie process which has been dead process.
        # Consider user wants to know the reason for dead process  due to exception,
        # we return True to let user in frontend can get the log for dead process.
        return True
    try:
        os.kill(pid, 0)
    except OSError:
        return False
    else:
        if 'fastdeployserve' not in psutil.Process(pid).name(
        ):  # We should judge the pid is fastdeployserver process, in case pid has been reassigned.
            # Note: I do not know why psutil.Process(pid).name() is fastdeployserve but not fastdeployserver.
            return False
        else:
            return True


_metric_column_name = {
    "Model": {
        "nv_inference_request_success", "nv_inference_request_failure",
        "nv_inference_count", "nv_inference_exec_count",
        "nv_inference_request_duration_us", "nv_inference_queue_duration_us",
        "nv_inference_compute_input_duration_us",
        "nv_inference_compute_infer_duration_us",
        "nv_inference_compute_output_duration_us"
    },
    "GPU": {
        "nv_gpu_power_usage", "nv_gpu_power_limit", "nv_energy_consumption",
        "nv_gpu_utilization", "nv_gpu_memory_total_bytes",
        "nv_gpu_memory_used_bytes"
    },
    "CPU": {
        "nv_cpu_utilization", "nv_cpu_memory_total_bytes",
        "nv_cpu_memory_used_bytes"
    }
}


def generate_metric_table(server_addr, server_port):  # noqa:C901
    model_table = {}
    gpu_table = {}
    try:
        res = requests.get("http://{}:{}/metrics".format(
            server_addr, server_port))
    except Exception:
        return None
    metric_content = res.text
    for content in metric_content.split('\n'):
        if content.startswith('#'):
            continue
        else:
            res = re.match(r'(\w+){(.*)} (\w+)',
                           content)  # match output by server metrics interface
            if not res:
                continue
            metric_name = res.group(1)
            model = res.group(2)
            value = res.group(3)
            infos = {}
            for info in model.split(','):
                k, v = info.split('=')
                v = v.strip('"')
                infos[k] = v
            if metric_name in [
                    "nv_inference_request_duration_us",
                    "nv_inference_queue_duration_us",
                    "nv_inference_compute_input_duration_us",
                    "nv_inference_compute_infer_duration_us",
                    "nv_inference_compute_output_duration_us"
            ]:
                value = float(value) / 1000
            elif metric_name in [
                    "nv_gpu_memory_total_bytes", "nv_gpu_memory_used_bytes"
            ]:
                value = float(value) / 1024 / 1024 / 1024
            for key, metric_names in _metric_column_name.items():
                if metric_name in metric_names:
                    if key == 'Model':
                        model_name = infos['model']
                        if model_name not in model_table:
                            model_table[model_name] = {}
                        model_table[model_name][metric_name] = value
                    elif key == 'GPU':
                        gpu_name = infos['gpu_uuid']
                        if gpu_name not in gpu_table:
                            gpu_table[gpu_name] = {}
                        gpu_table[gpu_name][metric_name] = value
                    elif key == 'CPU':
                        pass
    results = {}
    results['Model'] = model_table
    results['GPU'] = gpu_table
    return results
