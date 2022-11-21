import multiprocessing
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
