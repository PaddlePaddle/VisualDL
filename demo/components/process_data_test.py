# Copyright (c) 2021 VisualDL Authors. All Rights Reserve.
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

from visualdl.thirdparty.process_data import ModelAnalysis

if __name__ == "__main__":
    params = {
        "data_dir": "/home/work/visualdl_test",
        "hadoop_bin": "/home/work/hadoop/bin/hadoop",
        "ugi": "**",
        "debug_input": "afs://***/random_dump/join/20211015",
        # "debug_input": "/home/work/testuser/visualdl/data/random_dump/join/20211028", #local dump data
        "delta_num": "8",
        "join_pbtxt": "/home/work/test_download/train/join_main_program.pbtxt",
        "update_pbtxt": "/home/work/test_download/train/update_main_program.pbtxt"
    }
    model_analysis = ModelAnalysis(params)
    model_analysis()
