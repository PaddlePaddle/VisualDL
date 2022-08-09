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
import copy


class ClientManager:
    '''
    This class manages data with status like graph. For data with status but managed by backend,
    we should prevent data for different clients interfere with each other.
    '''

    def __init__(self, data):
        self._proto_data = data
        self.ip_data_map = {}

    def get_data(self, ip):
        if ip not in self.ip_data_map:
            self.ip_data_map[ip] = copy.deepcopy(self._proto_data)
        return self.ip_data_map[ip]
