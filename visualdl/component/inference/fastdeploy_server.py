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
import re
import shutil
import socket
import time
from multiprocessing import Process
from pathlib import Path

import requests

from .fastdeploy_client.client_app import create_gradio_client_app
from .fastdeploy_client.client_app import create_gradio_client_app_en
from .fastdeploy_lib import analyse_config
from .fastdeploy_lib import check_process_zombie
from .fastdeploy_lib import copy_config_file_to_default_config
from .fastdeploy_lib import delete_files_for_process
from .fastdeploy_lib import exchange_format_to_original_format
from .fastdeploy_lib import generate_metric_table
from .fastdeploy_lib import get_alive_fastdeploy_servers
from .fastdeploy_lib import get_config_filenames_for_one_model
from .fastdeploy_lib import get_config_for_one_model
from .fastdeploy_lib import get_process_model_configuration
from .fastdeploy_lib import get_process_output
from .fastdeploy_lib import get_start_arguments
from .fastdeploy_lib import json2pbtxt
from .fastdeploy_lib import kill_process
from .fastdeploy_lib import launch_process
from .fastdeploy_lib import mark_pid_for_dead_process
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
        self.client_port = None  # Chinese version
        self.client_en_port = None  # English version

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
        all_model_configs, all_model_versions = analyse_config(cur_dir)
        return original_format_to_exchange_format(all_model_configs,
                                                  all_model_versions)

    @result()
    def config_update(self, cur_dir, model_name, config, config_filename):
        config = json.loads(config)
        all_models = exchange_format_to_original_format(config)
        model_dir = os.path.join(os.path.abspath(cur_dir), model_name)
        filtered_config = validate_data(all_models[model_name])
        text_proto = json2pbtxt(json.dumps(filtered_config))
        # backup user's config data first, when data corrupted by front-end, we still can recovery data
        # backup config filename: {original_name}_vdlbackup_{datetime}.pbtxt
        # backup config can only used to restore config.pbtxt
        if 'vdlbackup' in config_filename:
            raise RuntimeError(
                "Backup config file is not permitted to update.")
        basename = os.path.splitext(config_filename)[0]
        shutil.copy(
            os.path.join(model_dir, config_filename),
            os.path.join(
                model_dir, '{}_vdlbackup_{}.pbtxt'.format(
                    basename,
                    datetime.datetime.now().isoformat())))
        with open(os.path.join(model_dir, config_filename), 'w') as f:
            f.write(text_proto)
        return

    @result()
    def start_server(self, configs):
        configs = json.loads(configs)
        process = launch_process(configs)
        if process.poll() is not None:
            raise RuntimeError(
                "Failed to launch fastdeployserver，please check fastdeployserver is installed in environment."
            )
        server_name = configs['server-name'] if configs[
            'server-name'] else str(process.pid)
        self.opened_servers[server_name] = process
        return server_name

    @result()
    def stop_server(self, server_id):
        if server_id in self.opened_servers:  # check if server_id in self.opened_servers
            kill_process(self.opened_servers[server_id])
            del self.opened_servers[server_id]
        elif server_id in set(
                os.listdir(FASTDEPLOYSERVER_PATH)):  # check if server_id in
            # FASTDEPLOYSERVER_PATH(may be launched by other vdl app instance by gunicorn)
            kill_process(server_id)
        delete_files_for_process(server_id)
        self._poll_zombie_process()

    @result('text/plain')
    def get_server_output(self, server_id, length):
        length = int(length)
        if server_id in self.opened_servers:  # check if server_id in self.opened_servers
            return get_process_output(server_id, length)
        elif str(server_id) in set(
                os.listdir(FASTDEPLOYSERVER_PATH)):  # check if server_id in
            # FASTDEPLOYSERVER_PATH(may be launched by other vdl app instance by gunicorn)
            return get_process_output(server_id, length)
        else:
            return

    @result()
    def get_server_metric(self, server_id):
        args = get_start_arguments(server_id)
        host = 'localhost'
        port = args.get('metrics-port', 8002)
        return generate_metric_table(host, port)

    @result()
    def get_server_list(self):
        return get_alive_fastdeploy_servers()

    @result()
    def check_server_alive(self, server_id):
        self._poll_zombie_process()
        if check_process_zombie(server_id) is True:
            raise RuntimeError(
                "Server {} is down due to exception or killed，please check the reason according to the log, "
                "then close this server.".format(server_id))
        return

    @result()
    def get_server_config(self, server_id):
        return get_process_model_configuration(server_id)

    @result()
    def get_pretrain_model_list(self):
        '''
        Get all available fastdeploy models from hub server.
        '''
        res = requests.get(
            'http://paddlepaddle.org.cn/paddlehub/fastdeploy_listmodels')
        result = res.json()
        if result['status'] != 0:
            raise RuntimeError(
                "Failed to get pre-trained model list from hub server.")
        else:
            data = result['data']
            model_list = {}
            for category, models in data.items():
                if category not in model_list:
                    model_list[category] = set()
                for model in models:
                    model_list[category].add(model['name'])
            # adapt data format for frontend
            models_info = []
            for category, model_names in model_list.items():
                models_info.append({
                    "value": category,
                    "label": category,
                    "children": []
                })
                for model_name in sorted(model_names):
                    models_info[-1]["children"].append({
                        "value": model_name,
                        "label": model_name
                    })
            return models_info

    @result()
    def download_pretrain_model(self, cur_dir, model_name, version,
                                pretrain_model_name):
        version_resource_dir = os.path.join(
            os.path.abspath(cur_dir), model_name, version)
        try:
            import fastdeploy as fd
        except Exception:
            raise RuntimeError(
                "fastdeploy is required for visualizing results，please refer to "
                "https://github.com/PaddlePaddle/FastDeploy to install fastdeploy"
            )
        model_path = fd.download_model(
            name=pretrain_model_name, path=version_resource_dir)
        if model_path:
            if '.onnx' in model_path:
                shutil.move(
                    model_path,
                    os.path.join(os.path.dirname(model_path), 'model.onnx'))
            else:
                for filename in os.listdir(model_path):
                    if '.pdmodel' in filename or '.pdiparams' in filename:
                        shutil.move(
                            os.path.join(model_path, filename),
                            os.path.join(
                                os.path.dirname(model_path), 'model{}'.format(
                                    os.path.splitext(filename)[1])))
                    else:
                        shutil.move(
                            os.path.join(model_path, filename),
                            os.path.join(
                                os.path.dirname(model_path), filename))
                shutil.rmtree(model_path)
            version_info_for_frontend = []
            for version_name in os.listdir(os.path.join(cur_dir, model_name)):
                if re.match(
                        r'\d+',
                        version_name):  # version directory consists of numbers
                    version_filenames_dict_for_frontend = {}
                    version_filenames_dict_for_frontend['title'] = version_name
                    version_filenames_dict_for_frontend['key'] = version_name
                    version_filenames_dict_for_frontend['children'] = []
                    for filename in os.listdir(
                            os.path.join(cur_dir, model_name, version_name)):
                        version_filenames_dict_for_frontend['children'].append(
                            {
                                'title': filename,
                                'key': filename
                            })
                    version_info_for_frontend.append(
                        version_filenames_dict_for_frontend)
            return version_info_for_frontend
        else:
            raise RuntimeError(
                "Failed to download pre-trained model {}.".format(
                    pretrain_model_name))

    @result()
    def get_config_for_model(self, cur_dir, name, config_filename):
        return get_config_for_one_model(cur_dir, name, config_filename)

    @result()
    def get_config_filenames_for_model(self, cur_dir, name):
        return get_config_filenames_for_one_model(cur_dir, name)

    @result()
    def delete_config_for_model(self, cur_dir, name, config_filename):
        if self.root_dir not in Path(
                os.path.abspath(cur_dir)
        ).parents:  # should prevent user remove files outside model-repository
            raise RuntimeError(
                'Failed to delete config file, please check filepath.')
        if os.path.exists(os.path.join(cur_dir, name, config_filename)):
            os.remove(os.path.join(cur_dir, name, config_filename))
        return get_config_filenames_for_one_model(cur_dir, name)

    @result()
    def set_default_config_for_model(self, cur_dir, name, config_filename):
        model_dir = os.path.join(os.path.abspath(cur_dir), name)
        # backup config.pbtxt to config_vdlbackup_{datetime}.pbtxt
        if os.path.exists(os.path.join(model_dir, 'config.pbtxt')):
            shutil.copy(
                os.path.join(model_dir, 'config.pbtxt'),
                os.path.join(
                    model_dir, 'config_vdlbackup_{}.pbtxt'.format(
                        datetime.datetime.now().isoformat())))
        if config_filename != 'config.pbtxt':
            copy_config_file_to_default_config(model_dir, config_filename)
        return

    @result()
    def delete_resource_for_model(self, cur_dir, model_name, version,
                                  resource_filename):
        if self.root_dir not in Path(
                os.path.abspath(cur_dir)
        ).parents:  # should prevent user remove files outside model-repository
            raise RuntimeError(
                'Failed to delete resource file, please check filepath.')
        resource_path = os.path.join(
            os.path.abspath(cur_dir), model_name, version, resource_filename)
        if os.path.exists(resource_path):
            os.remove(resource_path)
        version_info_for_frontend = []
        for version_name in os.listdir(os.path.join(cur_dir, model_name)):
            if re.match(r'\d+',
                        version_name):  # version directory consists of numbers
                version_filenames_dict_for_frontend = {}
                version_filenames_dict_for_frontend['title'] = version_name
                version_filenames_dict_for_frontend['key'] = version_name
                version_filenames_dict_for_frontend['children'] = []
                for filename in os.listdir(
                        os.path.join(cur_dir, model_name, version_name)):
                    version_filenames_dict_for_frontend['children'].append({
                        'title':
                        filename,
                        'key':
                        filename
                    })
                version_info_for_frontend.append(
                    version_filenames_dict_for_frontend)
        return version_info_for_frontend

    @result()
    def rename_resource_for_model(self, cur_dir, model_name, version,
                                  resource_filename, new_filename):
        if self.root_dir not in Path(
                os.path.abspath(cur_dir)
        ).parents:  # should prevent user remove files outside model-repository
            raise RuntimeError(
                'Failed to rename resource file, please check filepath.')
        resource_path = os.path.join(
            os.path.abspath(cur_dir), model_name, version, resource_filename)
        new_file_path = os.path.join(
            os.path.abspath(cur_dir), model_name, version, new_filename)
        if os.path.exists(resource_path):
            shutil.move(resource_path, new_file_path)
        version_info_for_frontend = []
        for version_name in os.listdir(os.path.join(cur_dir, model_name)):
            if re.match(r'\d+',
                        version_name):  # version directory consists of numbers
                version_filenames_dict_for_frontend = {}
                version_filenames_dict_for_frontend['title'] = version_name
                version_filenames_dict_for_frontend['key'] = version_name
                version_filenames_dict_for_frontend['children'] = []
                for filename in os.listdir(
                        os.path.join(cur_dir, model_name, version_name)):
                    version_filenames_dict_for_frontend['children'].append({
                        'title':
                        filename,
                        'key':
                        filename
                    })
                version_info_for_frontend.append(
                    version_filenames_dict_for_frontend)
        return version_info_for_frontend

    def create_fastdeploy_client(self, lang='zh'):
        def get_free_tcp_port():
            tcp = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            # tcp.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEPORT, 1)
            tcp.bind(('localhost', 0))
            addr, port = tcp.getsockname()
            tcp.close()
            return port

        def check_alive(client_port):
            while True:
                try:
                    requests.get('http://localhost:{}/'.format(client_port))
                    break
                except Exception:
                    time.sleep(1)

        if lang == 'en':
            if self.client_en_port is None:
                self.client_en_port = get_free_tcp_port()
                app = create_gradio_client_app_en()
                thread = Process(
                    target=app.launch,
                    kwargs={'server_port': self.client_en_port})
                thread.start()
                check_alive(self.client_en_port)
            return self.client_en_port
        else:
            if self.client_port is None:
                self.client_port = get_free_tcp_port()
                app = create_gradio_client_app()
                thread = Process(
                    target=app.launch,
                    kwargs={'server_port': self.client_port})
                thread.start()
                check_alive(self.client_port)
            return self.client_port

    def _poll_zombie_process(self):
        # check if there are servers killed by other vdl app instance and become zoombie
        should_delete = []
        for server_id, process in self.opened_servers.items():
            if process.poll() is not None:
                mark_pid_for_dead_process(server_id)
                should_delete.append(server_id)

        for server_id in should_delete:
            del self.opened_servers[server_id]


def create_fastdeploy_api_call():
    api = FastDeployServerApi()
    routes = {
        'get_directory': (api.get_directory, ['dir']),
        'config_update': (api.config_update,
                          ['dir', 'name', 'config', 'config_filename']),
        'get_config': (api.get_config, ['dir']),
        'get_config_filenames_for_model': (api.get_config_filenames_for_model,
                                           ['dir', 'name']),
        'get_config_for_model': (api.get_config_for_model,
                                 ['dir', 'name', 'config_filename']),
        'set_default_config_for_model': (api.set_default_config_for_model,
                                         ['dir', 'name', 'config_filename']),
        'delete_config_for_model': (api.delete_config_for_model,
                                    ['dir', 'name', 'config_filename']),
        'start_server': (api.start_server, ['config']),
        'stop_server': (api.stop_server, ['server_id']),
        'get_server_output': (api.get_server_output, ['server_id', 'length']),
        'create_fastdeploy_client': (api.create_fastdeploy_client, ['lang']),
        'get_server_list': (api.get_server_list, []),
        'get_server_metric': (api.get_server_metric, ['server_id']),
        'get_server_config': (api.get_server_config, ['server_id']),
        'get_pretrain_model_list': (api.get_pretrain_model_list, []),
        'check_server_alive': (api.check_server_alive, ['server_id']),
        'download_pretrain_model':
        (api.download_pretrain_model,
         ['dir', 'name', 'version', 'pretrain_model_name']),
        'delete_resource_for_model':
        (api.delete_resource_for_model,
         ['dir', 'name', 'version', 'resource_filename']),
        'rename_resource_for_model': (api.rename_resource_for_model, [
            'dir', 'name', 'version', 'resource_filename', 'new_filename'
        ])
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
