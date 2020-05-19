# Copyright (c) 2017 VisualDL Authors. All Rights Reserve.
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

import os
import mimetypes
from flask import (Response, send_from_directory)


class Template(object):
    extname = [".html", ".js", ".css"]

    def __init__(self, path, **context):
        if not os.path.exists(path):
            raise Exception("template file does not exist.")
        self.path = path
        self.files = {}
        self.mimetypes = {}
        for root, dirs, files in os.walk(path):
            for file in files:
                if any(file.endswith(name) for name in self.extname):
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, path)
                    content = ""
                    with open(file_path, "r") as f:
                        content = f.read()
                        for key, value in context.items():
                            content = content.replace("{{" + key + "}}", value)
                    self.files[rel_path] = content
                    self.mimetypes[rel_path] = mimetypes.guess_type(file)[0]

    def render(self, file):
        if file in self.files:
            return Response(response=self.files[file], mimetype=self.mimetypes[file])
        return send_from_directory(self.path, file)
