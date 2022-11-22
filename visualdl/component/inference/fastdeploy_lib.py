import os
import json
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
  for parent_dir, sub_dirs, filenames in os.walk(cur_dir):
    for filename in filenames:
      if '.pbtxt' in filename:
        model_name = os.path.basename(parent_dir)
        all_model_paths[model_name] = parent_dir
        json_config = json.loads(pbtxt2json(open(os.path.join(parent_dir, filename)).read()))
        all_model_configs[model_name] = json_config
        print(model_name)
        print(json.dumps(json_config, indent=2))


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
