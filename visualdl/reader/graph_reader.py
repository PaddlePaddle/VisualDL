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
import json

from visualdl.io import bfile
from visualdl.component.graph.graph_component import analyse_model

def is_VDLGraph_file(path):
    """Determine whether it is a VDL graph file according to the file name.

    File name of a VDL graph file must contain `vdlgraph`.

    Args:
        path: File name to determine.
    Returns:
        True if the file is a VDL graph file, otherwise false.
    """
    if "vdlgraph" not in path and 'pdmodel' not in path:
        return False
    return True

class GraphReader(object):
    """Graph reader to read vdl graph files, support for frontend api in lib.py.
    """

    def __init__(self, logdir=''):
        """Instance of GraphReader

        Args:
            logdir: The dir include vdl graph files, multiple subfolders allowed.
        """
        if isinstance(logdir, str):
            self.dir = [logdir]
        else:
            self.dir = logdir

        self.readers = {}
        self.walks = None
        self.displayname2runs = {}
        self.runs2displayname = {}
        self.graph_buffer = {}

    @property
    def logdir(self):
        return self.dir

    def get_all_walk(self):
        self.walks = {}
        for dir in self.dir:
            for root, dirs, files in bfile.walk(dir):
                self.walks.update({root: files})

    def graphs(self, update=False):
        """Get graph files.

        Every dir(means `run` in vdl) has only one graph file(means `actual log file`).

        Returns:
            walks: A dict like {"exp1": "vdlgraph.1587375595.log",
                                "exp2": "vdlgraph.1587375685.log"}
        """
        if self.walks is None or update is True:
            self.get_all_walk()

            walks_temp = {}
            for run, filenames in self.walks.items():
                tags_temp = [filename for filename in filenames if is_VDLGraph_file(filename)]
                tags_temp.sort(reverse=True)
                if len(tags_temp) > 0:
                    walks_temp.update({run: tags_temp[0]})
            self.walks = walks_temp
        return self.walks

  
    def runs(self, update=True):
        self.graphs(update=update)
        return list(self.walks.keys())
    
    def get_graph(self, run):
      if run in self.walks:
        if run in self.graph_buffer:
          return self.graph_buffer[run]
        else:
            if run == 'manual_input_model':
                data = bfile.BFile(self.walks[run], 'rb').read()
            else:
                data = bfile.BFile(bfile.join(run, self.walks[run]), 'rb').read()
            if 'pdmodel' in self.walks[run]:
                data = analyse_model(data)
            else:
                data = json.loads(data.decode())
            return data
    
    def set_displayname(self, log_reader):
      self.displayname2runs = log_reader.name2tags
      self.runs2displayname = log_reader.tags2name

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass