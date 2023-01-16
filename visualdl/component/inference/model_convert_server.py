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
import glob
import hashlib
import json
import os
import shutil
import tempfile
from threading import Lock

from flask import request
from x2paddle.convert import caffe2paddle
from x2paddle.convert import onnx2paddle

from .xarfile import archive
from .xarfile import unarchive
from visualdl.server.api import gen_result
from visualdl.server.api import result
from visualdl.utils.dir import X2PADDLE_CACHE_PATH

_max_cache_numbers = 200


class ModelConvertApi(object):
    def __init__(self):
        self.supported_formats = {'onnx', 'caffe'}
        self.lock = Lock()
        self.server_count = 0  # we use this variable to count requests handled,
        # and check the number of files every 100 requests.
        # If more than _max_cache_numbers files in cache, we delete the last recent used 50 files.

    @result()
    def convert_model(self, format):
        file_handle = request.files['file']
        data = file_handle.stream.read()
        if format not in self.supported_formats:
            raise RuntimeError('Model format {} is not supported. "\
          "Only onnx and caffe models are supported now.'.format(format))
        result = {}
        result['from'] = format
        result['to'] = 'paddle'
        # call x2paddle to convert models
        hl = hashlib.md5()
        hl.update(data)
        identity = hl.hexdigest()
        result['request_id'] = identity
        target_path = os.path.join(X2PADDLE_CACHE_PATH, identity)
        if os.path.exists(target_path):
            if os.path.exists(
                    os.path.join(target_path, 'inference_model',
                                 'model.pdmodel')):  # if data in cache
                with open(
                        os.path.join(target_path, 'inference_model',
                                     'model.pdmodel'), 'rb') as model_fp:
                    model_encoded = base64.b64encode(
                        model_fp.read()).decode('utf-8')
                result['pdmodel'] = model_encoded
                return result
        else:
            os.makedirs(target_path, exist_ok=True)
        with tempfile.NamedTemporaryFile() as fp:
            fp.write(data)
            fp.flush()
            try:
                if format == 'onnx':
                    try:
                        import onnx  # noqa: F401
                    except Exception:
                        raise RuntimeError(
                            "[ERROR] onnx is not installed, use \"pip install onnx>=1.6.0\"."
                        )
                    onnx2paddle(fp.name, target_path)
                elif format == 'caffe':
                    with tempfile.TemporaryDirectory() as unarchivedir:
                        unarchive(fp.name, unarchivedir)
                        prototxt_path = None
                        weight_path = None
                        for dirname, subdirs, filenames in os.walk(
                                unarchivedir):
                            for filename in filenames:
                                if '.prototxt' in filename:
                                    prototxt_path = os.path.join(
                                        dirname, filename)
                                if '.caffemodel' in filename:
                                    weight_path = os.path.join(
                                        dirname, filename)
                        if prototxt_path is None or weight_path is None:
                            raise RuntimeError(
                                ".prototxt or .caffemodel file is missing in your archive file, "
                                "please check files uploaded.")
                        caffe2paddle(prototxt_path, weight_path, target_path,
                                     None)
            except Exception as e:
                raise RuntimeError(
                    "[Convertion error] {}.\n Please open an issue at "
                    "https://github.com/PaddlePaddle/X2Paddle/issues to report your problem."
                    .format(e))
        with self.lock:  # we need to enter dirname(target_path) to archive,
            # in case unneccessary directory added in archive.
            origin_dir = os.getcwd()
            os.chdir(os.path.dirname(target_path))
            archive(os.path.basename(target_path))
            os.chdir(origin_dir)
            self.server_count += 1
        with open(
                os.path.join(target_path, 'inference_model', 'model.pdmodel'),
                'rb') as model_fp:
            model_encoded = base64.b64encode(model_fp.read()).decode('utf-8')
        result['pdmodel'] = model_encoded
        return result

    @result('application/octet-stream')
    def download_model(self, request_id):
        if os.path.exists(
                os.path.join(X2PADDLE_CACHE_PATH,
                             '{}.tar'.format(request_id))):
            with open(
                    os.path.join(X2PADDLE_CACHE_PATH,
                                 '{}.tar'.format(request_id)), 'rb') as f:
                data = f.read()
            if self.server_count % 100 == 0:  # we check number of files every 100 request
                file_paths = glob.glob(
                    os.path.join(X2PADDLE_CACHE_PATH, '*.tar'))
                if len(file_paths) >= _max_cache_numbers:
                    file_paths = sorted(
                        file_paths, key=os.path.getctime, reverse=True)
                    for file_path in file_paths:
                        try:
                            os.remove(file_path)
                            shutil.rmtree(
                                os.path.join(
                                    os.path.dirname(file_path),
                                    os.path.splitext(
                                        os.path.basename(file_path))[0]))
                        except Exception:
                            pass
            return data


def create_model_convert_api_call():
    api = ModelConvertApi()
    routes = {
        'convert': (api.convert_model, ['format']),
        'download': (api.download_model, ['request_id'])
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
