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

from __future__ import absolute_import

import os

from visualdl.writer.writer import LogWriter  # noqa
from visualdl.version import vdl_version as __version__
from visualdl.utils.dir import init_vdl_config

init_vdl_config()

ROOT = os.path.dirname(__file__)
