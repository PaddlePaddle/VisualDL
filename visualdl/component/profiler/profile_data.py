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
from .parser.distributed_parser import DistributedParser
from .parser.kernel_parser import KernelParser
from .parser.memory_parser import MemoryParser
from .parser.operator_parser import OperatorParser
from .parser.overview_parser import OverviewParser
from .parser.trace_parser import TraceParser
from .parser.parse_data import DataParser

class ProfileData:
  '''
  Hold all parsed data to serve for user requests.
  '''
  def __init__(self, filename):

    return

class DistributedProfileData:
  '''
  Hold data for distributed view.
  Aggregate all data for distributed in ProfileData object.
  '''
  def __init__(self):
    return

