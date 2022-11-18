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
import os

from visualdl.component.graph import analyse_model
from visualdl.component.graph import Model
from visualdl.io import bfile


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

        self.walks = {}
        self.displayname2runs = {}
        self.runs2displayname = {}
        self.graph_buffer = {}
        self.walks_buffer = {}

    @property
    def logdir(self):
        return self.dir

    def component_tabs(self, update=False):
        """Get component tabs used by vdl frontend.
        """
        component_tabs = set()
        if not self.logdir:
            return component_tabs
        if update is True:
            self.runs(update=update)
        if self.walks:
            component_tabs.add('dynamic_graph')
        return component_tabs

    def get_all_walk(self):
        flush_walks = {}
        for dir in self.dir:
            dir = os.path.realpath(dir)
            for root, dirs, files in bfile.walk(dir):
                flush_walks.update({root: files})
        return flush_walks

    def graphs(self, update=False):
        """Get graph files.

        Every dir(means `run` in vdl) has only one graph file(means `actual log file`).

        Returns:
            walks: A dict like {"exp1": "vdlgraph.1587375595.log",
                                "exp2": "vdlgraph.1587375685.log"}
        """
        if not self.walks or update is True:
            flush_walks = self.get_all_walk()

            walks_temp = {}
            for run, filenames in flush_walks.items():
                tags_temp = [
                    filename for filename in filenames
                    if is_VDLGraph_file(filename)
                ]
                tags_temp.sort(reverse=True)
                if len(tags_temp) > 0:
                    walks_temp.update({run: tags_temp[0]})
            self.walks = walks_temp
        return self.walks

    def runs(self, update=True):
        self.graphs(update=update)
        graph_runs = list(self.walks.keys(
        )) if 'manual_input_model' not in self.graph_buffer else list(
            self.walks.keys()) + ['manual_input_model']
        return sorted(graph_runs)

    def get_graph(self,
                  run,
                  nodeid=None,
                  expand=False,
                  keep_state=False,
                  expand_all=False,
                  refresh=False):
        if run == 'manual_input_model' and run in self.graph_buffer:
            graph_model = self.graph_buffer[run]
            if nodeid is not None:
                graph_model.adjust_visible(nodeid, expand, keep_state)
            return graph_model.make_graph(
                refresh=refresh, expand_all=expand_all)
        if run in self.walks:
            if run in self.walks_buffer:
                if self.walks[run] == self.walks_buffer[run]:
                    graph_model = self.graph_buffer[run]
                    if nodeid is not None:
                        graph_model.adjust_visible(nodeid, expand, keep_state)
                    return graph_model.make_graph(
                        refresh=refresh, expand_all=expand_all)

            data = bfile.BFile(bfile.join(run, self.walks[run]), 'rb').read()
            if 'pdmodel' in self.walks[run]:
                graph_model = Model(analyse_model(data))
            else:
                graph_model = Model(json.loads(data.decode()))
            self.graph_buffer[run] = graph_model
            self.walks_buffer[run] = self.walks[run]
            if nodeid is not None:
                graph_model.adjust_visible(nodeid, expand, keep_state)
            return graph_model.make_graph(
                refresh=refresh, expand_all=expand_all)

    def search_graph_node(self, run, nodeid, keep_state=False, is_node=True):
        if run == 'manual_input_model' and run in self.graph_buffer:
            graph_model = self.graph_buffer[run]
            graph_model.adjust_search_node_visible(
                nodeid, keep_state=keep_state, is_node=is_node)
            return graph_model.make_graph(refresh=False, expand_all=False)
        if run in self.walks:
            if run in self.walks_buffer:
                if self.walks[run] == self.walks_buffer[run]:
                    graph_model = self.graph_buffer[run]
                    graph_model.adjust_search_node_visible(
                        nodeid, keep_state=keep_state, is_node=is_node)
                    return graph_model.make_graph(
                        refresh=False, expand_all=False)

            data = bfile.BFile(bfile.join(run, self.walks[run]), 'rb').read()
            if 'pdmodel' in self.walks[run]:
                graph_model = Model(analyse_model(data))
            else:
                graph_model = Model(json.loads(data.decode()))
            self.graph_buffer[run] = graph_model
            self.walks_buffer[run] = self.walks[run]
            graph_model.adjust_search_node_visible(
                nodeid, keep_state=keep_state, is_node=is_node)
            return graph_model.make_graph(refresh=False, expand_all=False)

    def get_all_nodes(self, run):
        if run == 'manual_input_model' and run in self.graph_buffer:
            graph_model = self.graph_buffer[run]
            return graph_model.get_all_leaf_nodes()
        if run in self.walks:
            if run in self.walks_buffer:
                if self.walks[run] == self.walks_buffer[run]:
                    graph_model = self.graph_buffer[run]
                    return graph_model.get_all_leaf_nodes()

            data = bfile.BFile(bfile.join(run, self.walks[run]), 'rb').read()
            if 'pdmodel' in self.walks[run]:
                graph_model = Model(analyse_model(data))
            else:
                graph_model = Model(json.loads(data.decode()))
            self.graph_buffer[run] = graph_model
            self.walks_buffer[run] = self.walks[run]
            return graph_model.get_all_leaf_nodes()

    def set_displayname(self, log_reader):
        self.displayname2runs = log_reader.name2tags
        self.runs2displayname = log_reader.tags2name

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass

    def set_input_graph(self, content, file_type='pdmodel'):
        if isinstance(content, str):
            if not is_VDLGraph_file(content):
                return
            if 'pdmodel' in content:
                file_type = 'pdmodel'
            else:
                file_type = 'vdlgraph'
            content = bfile.BFile(content, 'rb').read()

        if file_type == 'pdmodel':
            data = analyse_model(content)
            self.graph_buffer['manual_input_model'] = Model(data)

        elif file_type == 'vdlgraph':
            self.graph_buffer['manual_input_model'] = Model(
                json.loads(content.decode()))

        else:
            return
