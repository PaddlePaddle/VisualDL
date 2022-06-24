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
from .profile_data import ProfileData

class RunManager:
  '''
  Manage profile data for each run, each run may have multiple workers and spans.
  We should manage profile data of each (worker, span) unit. 
  Besides, a special worker "all" is created to merge all profile data for distributed view.
  '''
  def __init__(self, run, worker, filenames):
    self.run = run
    self.worker = worker
    

