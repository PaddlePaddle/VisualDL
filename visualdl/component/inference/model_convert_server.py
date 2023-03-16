# flake8: noqa
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
import hashlib
import json
import os
import shutil
import tempfile

import paddle
import paddle2onnx
from flask import request
from x2paddle.convert import onnx2paddle

from .xarfile import archive
from visualdl.io.bfile import BosFileSystem
from visualdl.server.api import gen_result
from visualdl.server.api import result
from visualdl.utils.dir import X2PADDLE_CACHE_PATH

_max_cache_numbers = 200


class ModelConvertApi(object):
    '''!
    Integrate multiple model convertion tools, and provide convertion service for users.
    When user uploads a model to this server, convert model and upload the results to VDL Bos.
    When user downloads the model, we get the data from Bos and send it to client.
    Maybe users can download from bos directy if frontend can achieve it.
    '''

    def __init__(self):
        '''
        Initialize a object to provide service. Need a BosFileSystem client to write data.
        '''
        try:
            self.bos_client = BosFileSystem()
            self.bucket_name = os.getenv("BOS_BUCKET_NAME")
        except Exception:
            # When BOS_HOST, BOS_AK, BOS_SK, BOS_STS are not set in the environment variables.
            # We use VDL BOS by default
            self.bos_client = BosFileSystem(write_flag=False)
            self.bos_client.renew_bos_client_from_server()
            self.bucket_name = 'visualdl-server'

    @result()
    def onnx2paddle_model_convert(self, convert_to_lite, lite_valid_places,
                                  lite_model_type):  # noqa:C901
        '''
        Convert onnx model to paddle model.
        '''
        model_handle = request.files['model']
        data = model_handle.stream.read()
        result = {}
        # Do a simple data verification
        if convert_to_lite in ['true', 'True', 'yes', 'Yes', 'y']:
            convert_to_lite = True
        else:
            convert_to_lite = False

        if lite_valid_places not in [
                'arm', 'opencl', 'x86', 'metal', 'xpu', 'bm', 'mlu',
                'intel_fpga', 'huawei_ascend_npu', 'imagination_nna',
                'rockchip_npu', 'mediatek_apu', 'huawei_kirin_npu',
                'amlogic_npu'
        ]:
            lite_valid_places = 'arm'
        if lite_model_type not in ['protobuf', 'naive_buffer']:
            lite_model_type = 'naive_buffer'

        # call x2paddle to convert models
        hl = hashlib.md5()
        hl.update(data)
        identity = hl.hexdigest()
        result['request_id'] = identity

        target_path = os.path.join(X2PADDLE_CACHE_PATH, 'onnx2paddle',
                                   identity)
        if not os.path.exists(target_path):
            os.makedirs(target_path, exist_ok=True)
        with tempfile.NamedTemporaryFile() as fp:
            fp.write(data)
            fp.flush()
            try:
                import onnx  # noqa: F401
            except Exception:
                raise RuntimeError(
                    "[ERROR] onnx is not installed, use \"pip install onnx>=1.6.0\"."
                )
            try:
                if convert_to_lite is False:
                    with paddle.fluid.dygraph.guard():
                        onnx2paddle(
                            fp.name,
                            target_path,
                            convert_to_lite=convert_to_lite)
                else:
                    with paddle.fluid.dygraph.guard():
                        onnx2paddle(
                            fp.name,
                            target_path,
                            convert_to_lite=convert_to_lite,
                            lite_valid_places=lite_valid_places,
                            lite_model_type=lite_model_type)
            except Exception as e:
                raise RuntimeError(
                    "[Convertion error] {}.\n Please open an issue at "
                    "https://github.com/PaddlePaddle/X2Paddle/issues to report your problem."
                    .format(e))

            origin_dir = os.getcwd()
            os.chdir(os.path.dirname(target_path))
            archive(os.path.basename(target_path))
            os.chdir(origin_dir)
            with open(
                    os.path.join(X2PADDLE_CACHE_PATH, 'onnx2paddle',
                                 '{}.tar'.format(identity)), 'rb') as f:
                # upload archived transformed model to vdl bos
                data = f.read()
                filename = 'bos://{}/onnx2paddle/{}.tar'.format(
                    self.bucket_name, identity)
                try:
                    self.bos_client.write(filename, data, append=False)
                except Exception as e:
                    print(
                        "Exception: Write file {}.tar to bos failed, due to {}"
                        .format(identity, e))
        with open(
                os.path.join(target_path, 'inference_model', 'model.pdmodel'),
                'rb') as model_fp:
            # upload pdmodel file to bos, if some model has been transformed before, we can directly download from bos
            filename = 'bos://{}/onnx2paddle/{}/model.pdmodel'.format(
                self.bucket_name, identity)
            data = model_fp.read()
            try:
                self.bos_client.write(filename, data)
            except Exception as e:
                print(
                    "Exception: Write file {}/model.pdmodel to bos failed, due to {}"
                    .format(identity, e))
            # return transformed pdmodel file to frontend to show model structure graph
            model_encoded = base64.b64encode(data).decode('utf-8')
        # delete target_path
        shutil.rmtree(target_path)
        result['model'] = model_encoded
        print(len(model_encoded))
        return result

    @result('application/octet-stream')
    def onnx2paddle_model_download(self, request_id):
        '''
        Download converted paddle model from bos.
        '''
        filename = 'bos://{}/onnx2paddle/{}.tar'.format(
            self.bucket_name, request_id)
        data = None
        if self.bos_client.exists(filename):
            data = self.bos_client.read_file(filename)
        if not data:
            raise RuntimeError(
                "The requested model can not be downloaded due to not existing or convertion failed."
            )
        print(len(data))
        return data

    @result()
    def paddle2onnx_convert(self, opset_version, deploy_backend):
        '''
        Convert paddle model to onnx model.
        '''
        model_handle = request.files['model']
        params_handle = request.files['param']
        model_data = model_handle.stream.read()
        param_data = params_handle.stream.read()
        result = {}
        # Do a simple data verification
        try:
            opset_version = int(opset_version)
        except Exception:
            opset_version = 11

        if deploy_backend not in ['onnxruntime', 'tensorrt', 'others']:
            deploy_backend = 'onnxruntime'

        # call paddle2onnx to convert models
        hl = hashlib.md5()
        hl.update(model_data + param_data)
        identity = hl.hexdigest()
        result['request_id'] = identity

        with tempfile.NamedTemporaryFile() as model_fp:
            with tempfile.NamedTemporaryFile() as param_fp:
                model_fp.write(model_data)
                param_fp.write(param_data)
                model_fp.flush()
                param_fp.flush()
                try:
                    onnx_model = paddle2onnx.export(
                        model_fp.name,
                        param_fp.name,
                        opset_version=opset_version,
                        deploy_backend=deploy_backend)
                except Exception as e:
                    raise RuntimeError(
                        "[Convertion error] {}.\n Please open an issue at "
                        "https://github.com/PaddlePaddle/Paddle2ONNX/issues to report your problem."
                        .format(e))
                if not onnx_model:
                    raise RuntimeError(
                        "[Convertion error] Please check your input model and param files."
                    )

                # upload transformed model to vdl bos
                filename = 'bos://{}/paddle2onnx/{}/model.onnx'.format(
                    self.bucket_name, identity)
                model_encoded = None
                if onnx_model:
                    try:
                        self.bos_client.write(
                            filename, onnx_model, append=False)
                    except Exception as e:
                        print(
                            "Exception: Write file {}/model.onnx to bos failed, due to {}"
                            .format(identity, e))
                    model_encoded = base64.b64encode(onnx_model).decode(
                        'utf-8')
        result['model'] = model_encoded
        print(len(model_encoded))
        return result

    @result('application/octet-stream')
    def paddle2onnx_download(self, request_id):
        '''
        Download converted onnx model from bos.
        '''
        filename = 'bos://{}/paddle2onnx/{}/model.onnx'.format(
            self.bucket_name, request_id)
        data = None
        if self.bos_client.exists(filename):
            data = self.bos_client.read_file(filename)
        if not data:
            raise RuntimeError(
                "The requested model can not be downloaded due to not existing or convertion failed."
            )
        print(len(data))
        return data


def create_model_convert_api_call():
    api = ModelConvertApi()
    routes = {
        'paddle2onnx/convert': (api.paddle2onnx_convert,
                                ['opset_version', 'deploy_backend']),
        'paddle2onnx/download': (api.paddle2onnx_download, ['request_id']),
        'onnx2paddle/convert':
        (api.onnx2paddle_model_convert,
         ['convert_to_lite', 'lite_valid_places', 'lite_model_type']),
        'onnx2paddle/download': (api.onnx2paddle_model_download,
                                 ['request_id'])
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
