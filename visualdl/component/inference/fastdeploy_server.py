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
import datetime
import json
import os
import shutil
import socket
import time
from multiprocessing import Process
from pathlib import Path

import requests

from .fastdeploy_client.client_app import create_gradio_client_app
from .fastdeploy_lib import analyse_config
from .fastdeploy_lib import exchange_format_to_original_format
from .fastdeploy_lib import get_process_output
from .fastdeploy_lib import json2pbtxt
from .fastdeploy_lib import kill_process
from .fastdeploy_lib import launch_process
from .fastdeploy_lib import original_format_to_exchange_format
from .fastdeploy_lib import validate_data
from visualdl.server.api import gen_result
from visualdl.server.api import result
from visualdl.utils.dir import FASTDEPLOYSERVER_PATH


class FastDeployServerApi(object):
    def __init__(self):
        self.root_dir = Path(os.getcwd())
        self.opened_servers = {
        }  # Use to store the opened server process pid and process itself
        self.client_port = None
        self.model_paths = {}

    @result()
    def get_directory(self, cur_dir):
        if self.root_dir not in Path(os.path.abspath(cur_dir)).parents:
            cur_dir = '.'
        cur_dir, sub_dirs, filenames = os.walk(cur_dir).send(None)
        if Path(self.root_dir) != Path(os.path.abspath(cur_dir)):
            sub_dirs.append('..')
        sub_dirs = sorted(sub_dirs)
        directorys = {
            'parent_dir':
            os.path.relpath(Path(os.path.abspath(cur_dir)), self.root_dir),
            'sub_dir':
            sub_dirs
        }
        return directorys

    @result()
    def get_config(self, cur_dir):
        all_model_configs, all_model_versions, all_model_paths = analyse_config(
            cur_dir)
        for name, value in all_model_paths.items():
            self.model_paths[(Path(os.path.abspath(cur_dir)), name)] = value
        return original_format_to_exchange_format(all_model_configs,
                                                  all_model_versions)

    @result()
    def config_update(self, cur_dir, model_name, config):
        config = json.loads(config)
        all_models = exchange_format_to_original_format(config)
        model_dir = self.model_paths[(Path(os.path.abspath(cur_dir)),
                                      model_name)]
        filtered_config = validate_data(all_models[model_name])
        text_proto = json2pbtxt(json.dumps(filtered_config))
        # backup user's config.pbtxt first, when data corrupted by front-end, we still can recovery data
        shutil.copy(
            os.path.join(model_dir, 'config.pbtxt'),
            os.path.join(
                model_dir, 'config_vdlbackup_{}.pbtxt'.format(
                    datetime.datetime.now().isoformat())))
        with open(os.path.join(model_dir, 'config.pbtxt'), 'w') as f:
            f.write(text_proto)
        return

    @result()
    def start_server(self, configs):
        configs = json.loads(configs)
        process = launch_process(configs)
        if process.poll() is not None:
            raise RuntimeError(
                "Launch fastdeploy server failed, please check your launching arguments"
            )
        self.opened_servers[process.pid] = process
        return process.pid

    @result()
    def stop_server(self, server_id):
        server_id = int(server_id)
        if server_id in self.opened_servers:  # check if server_id in self.opened_servers
            kill_process(self.opened_servers[server_id])
            del self.opened_servers[server_id]
        elif str(server_id) in set(
                os.listdir(FASTDEPLOYSERVER_PATH)):  # check if server_id in
            # FASTDEPLOYSERVER_PATH(may be launched by other vdl app instance by gunicorn)
            kill_process(server_id)
        # check if there are servers killed by other vdl app instance and become zoombie
        for server_id, process in self.opened_servers.items():
            if process.poll() is not None:
                del self.opened_servers[server_id]

    @result('text/plain')
    def get_server_output(self, server_id, length):
        server_id = int(server_id)
        length = int(length)
        if server_id in self.opened_servers:  # check if server_id in self.opened_servers
            return get_process_output(server_id, length)
        elif str(server_id) in set(
                os.listdir(FASTDEPLOYSERVER_PATH)):  # check if server_id in
            # FASTDEPLOYSERVER_PATH(may be launched by other vdl app instance by gunicorn)
            return get_process_output(server_id, length)
        else:
            return

    def create_fastdeploy_client(self):
        if self.client_port is None:

            def get_free_tcp_port():
                tcp = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                # tcp.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
                tcp.bind(('localhost', 0))
                addr, port = tcp.getsockname()
                tcp.close()
                return port

            self.client_port = get_free_tcp_port()
            app = create_gradio_client_app()
            thread = Process(
                target=app.launch, kwargs={'server_port': self.client_port})
            thread.start()

            def check_alive():
                while True:
                    try:
                        requests.get('http://localhost:{}/'.format(
                            self.client_port))
                        break
                    except Exception:
                        time.sleep(1)

            check_alive()
        return self.client_port


def create_fastdeploy_api_call():
    api = FastDeployServerApi()
    routes = {
        'get_directory': (api.get_directory, ['dir']),
        'config_update': (api.config_update, ['dir', 'name', 'config']),
        'get_config': (api.get_config, ['dir']),
        'start_server': (api.start_server, ['config']),
        'stop_server': (api.stop_server, ['server_id']),
        'get_server_output': (api.get_server_output, ['server_id', 'length']),
        'create_fastdeploy_client': (api.create_fastdeploy_client, [])
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
