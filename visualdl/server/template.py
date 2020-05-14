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
from shutil import (copytree, rmtree)


def render(path, dest, **context):
    clean(dest)
    copytree(path, dest)
    for root, dirs, files in os.walk(dest):
        for file in files:
            if file.endswith(".html") or file.endswith(".js") or file.endswith(".css"):
                file_path = os.path.join(root, file)
                content = ""
                with open(file_path, "r") as f:
                    content = f.read()
                for key, value in context.items():
                    content = content.replace("{{" + key + "}}", value)
                with open(file_path, "w") as f:
                    f.write(content)


def clean(path):
    if os.path.exists(path):
        rmtree(path)
