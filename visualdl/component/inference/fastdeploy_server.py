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
import base64
import json
import os
import tempfile
from collections import deque
from pathlib import Path
from threading import Lock

from flask import request

from .fastdeploy_lib import get_process_output
from .fastdeploy_lib import json2pbtxt
from .fastdeploy_lib import kill_process
from .fastdeploy_lib import launch_process
from .fastdeploy_lib import pbtxt2json
from visualdl.server.api import gen_result
from visualdl.server.api import result


class FastDeployServerApi(object):
    def __init__(self):
        self.root_dir = Path(os.getcwd())
        self.opened_servers = {
        }  # Use to store the opened server process pid and process itself

    @result()
    def get_directory(self, cur_dir):
        if self.root_dir not in Path(os.path.abspath(cur_dir)).parents:
            cur_dir = '.'
        cur_dir, sub_dirs, filenames = os.walk(cur_dir).send(None)
        if Path(self.root_dir) != Path(os.path.abspath(cur_dir)):
            sub_dirs.append('..')
        directorys = {
            'parent_dir':
            os.path.relpath(Path(os.path.abspath(cur_dir)), self.root_dir),
            'sub_dir':
            sub_dirs
        }
        return directorys

    @result()
    def get_config(self, cur_dir):
        pass

    @result()
    def config_update(self, cur_dir, model_name, config):
        pass

    @result()
    def start_server(self, configs):
        process = launch_process(configs)
        self.opened_servers[process.pid] = process
        return process.pid

    @result()
    def stop_server(self, server_id):
        if server_id not in self.opened_servers:
            return
        kill_process(self.opened_servers[server_id])
        del self.opened_servers[server_id]

    @result('text/plain')
    def get_server_output(self, server_id):
        stdout_generator = get_process_output(server_id)
        return stdout_generator


def create_fastdeploy_api_call():
    api = FastDeployServerApi()
    routes = {
        'get_directory': (api.get_directory, ['dir']),
        'config_update': (api.config_update, ['dir', 'name', 'config']),
        'get_config': (api.get_config, ['dir']),
        'start_server': (api.start_server, ['dir', 'args']),
        'stop_server': (api.stop_server, ['server_id']),
        'get_server_output': (api.get_server_output, ['server_id']),
        'test_server': (api.test_server_with_gradio, ['server_id'])
    }

    def call(path: str, args):
        route = routes.get(path)
        if not route:
            return json.dumps(gen_result(
                status=1, msg='api not found')), 'application/json', None
        method, call_arg_names = route
        call_args = [args.get(name) for name in call_arg_names]
        return method(*call_args)

    return call
