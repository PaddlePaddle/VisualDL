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
from threading import Lock

from flask import request
from x2paddle.convert import caffe2paddle
from x2paddle.convert import onnx2paddle

from .xarfile import archive
from .xarfile import unarchive
from visualdl.server.api import gen_result
from visualdl.server.api import result


class ModelConvertApi(object):
    def __init__(self):
        self.supported_formats = {'onnx', 'caffe'}
        self.lock = Lock()
        self.translated_models = deque(
            maxlen=5)  # used to store user's translated model for download
        self.request_id = 0  # used to store user's request

    @result()
    def convert_model(self, format):
        file_handle = request.files['file']
        data = file_handle.stream.read()
        if format not in self.supported_formats:
            raise RuntimeError('Model format {} is not supported. \
          Only onnx and caffe models are supported now.'.format(format))
        result = {}
        result['from'] = format
        result['to'] = 'paddle'
        # call x2paddle to convert models
        with tempfile.TemporaryDirectory(
                suffix='x2paddle_translated_models') as tmpdirname:
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
                        onnx2paddle(fp.name, tmpdirname)
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
                                    ".prototxt or .caffemodel file is missing in your archive file, \
                    please check files uploaded.")
                            caffe2paddle(prototxt_path, weight_path,
                                         tmpdirname, None)
                except Exception as e:
                    raise RuntimeError(
                        "[Convertion error] {}.\n Please open an issue at \
                            https://github.com/PaddlePaddle/X2Paddle/issues to report your problem."
                        .format(e))
                with self.lock:
                    origin_dir = os.getcwd()
                    os.chdir(os.path.dirname(tmpdirname))
                    archive_path = os.path.join(
                        os.path.dirname(tmpdirname),
                        archive(os.path.basename(tmpdirname)))
                    os.chdir(origin_dir)
                    result['request_id'] = self.request_id
                    self.request_id += 1
            with open(archive_path, 'rb') as archive_fp:
                self.translated_models.append((result['request_id'],
                                               archive_fp.read()))
            with open(
                    os.path.join(tmpdirname, 'inference_model',
                                 'model.pdmodel'), 'rb') as model_fp:
                model_encoded = base64.b64encode(
                    model_fp.read()).decode('utf-8')
            result['pdmodel'] = model_encoded
            if os.path.exists(archive_path):
                os.remove(archive_path)

        return result

    @result('application/octet-stream')
    def download_model(self, request_id):
        for stored_request_id, data in self.translated_models:
            if str(stored_request_id) == request_id:
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
