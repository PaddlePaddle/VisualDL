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
import collections
import functools
import json
import re
import sys
import tempfile

from .utils import traverse_tree

_show_name_pattern = re.compile(r'(.+)(\[.+\])')
_show_tid_pattern = re.compile(r'\w+(\(.+\))')

host_node_type_map = {
    "Operator", "Dataloader", "ProfileStep", "CudaRuntime", "UserDefined",
    "OperatorInner", "Forward", "Backward", "Optimization", "Communication",
    "PythonOp", "PythonUserDefined"
}

device_node_type_map = {"Kernel", "Memcpy", "Memset"}

memory_node_event_map = {
    "Allocate", "Free", "ReservedAllocate", "ReservedFree"
}


class HostNode:
    def __init__(self):
        self.name = None
        self.type = None
        self.start_ns = 0
        self.end_ns = 0
        self.process_id = 0
        self.thread_id = 0
        self.correlation_id = -1
        self.input_shapes = {}
        self.dtypes = {}
        self.callstack = ""
        self.children_node = []
        self.runtime_node = []
        self.device_node = []
        self.mem_node = []

    @classmethod
    def from_json(cls, json_obj):
        self = cls()
        self.name = json_obj['name'].replace(
            _show_name_pattern.match(json_obj['name']).group(2), "")
        self.type = json_obj['cat']
        self.start_ns = int(
            float(json_obj['args']['start_time'].split(' ')[0]) * 1000)
        self.end_ns = int(
            float(json_obj['args']['end_time'].split(' ')[0]) * 1000)
        self.process_id = json_obj['pid']
        self.thread_id = json_obj['tid'].replace(
            _show_tid_pattern.match(json_obj['tid']).group(1), "")
        self.correlation_id = json_obj['args'][
            'correlation id'] if 'correlation id' in json_obj['args'] else -1
        self.input_shapes = json_obj['args'][
            'input_shapes'] if 'input_shapes' in json_obj['args'] else {}
        self.dtypes = json_obj['args'][
            'input_dtypes'] if 'input_dtypes' in json_obj['args'] else {}
        self.callstack = json_obj['args'][
            'callstack'] if 'callstack' in json_obj['args'] else ""
        self.children_node = []
        self.runtime_node = []
        self.device_node = []
        self.mem_node = []
        return self

    @classmethod
    def from_protobuf(cls, obj):
        self = cls()
        self.name = obj.name
        self.type = str(obj.type).split('.')[1]
        self.start_ns = obj.start_ns
        self.end_ns = obj.end_ns
        self.process_id = obj.process_id
        self.thread_id = obj.thread_id
        self.correlation_id = obj.correlation_id
        self.input_shapes = obj.input_shapes
        self.dtypes = obj.dtypes
        self.callstack = obj.callstack
        self.children_node = []
        self.runtime_node = []
        self.device_node = []
        self.mem_node = []
        return self


class MemNode:
    def __init__(self):
        self.type = None
        self.timestamp_ns = 0
        self.addr = 0
        self.process_id = 0
        self.thread_id = 0
        self.increase_bytes = 0
        self.place = None
        self.current_allocated = 0
        self.current_reserved = 0
        self.peak_allocated = 0
        self.peak_reserved = 0

    @classmethod
    def from_json(cls, json_obj):
        self = cls()
        self.type = json_obj['cat']
        self.timestamp_ns = json_obj['ts'] * 1000
        self.addr = hex(int(
            json_obj['args']['addr'])) if 'addr' in json_obj['args'] else 0
        self.process_id = json_obj['pid']
        self.thread_id = json_obj['tid'].replace(
            _show_tid_pattern.match(json_obj['tid']).group(1), "")
        self.increase_bytes = json_obj['args'][
            'increase_bytes'] if 'increase_bytes' in json_obj['args'] else 0
        self.place = json_obj['args']['place'] if 'place' in json_obj[
            'args'] else "Place(cpu)"
        self.current_allocated = json_obj['args'][
            'current_allocated'] if 'current_allocated' in json_obj[
                'args'] else 0
        self.current_reserved = json_obj['args'][
            'current_reserved'] if 'current_reserved' in json_obj['args'] else 0
        self.peak_allocated = json_obj['args'][
            'peak_allocated'] if 'peak_allocated' in json_obj['args'] else 0
        self.peak_reserved = json_obj['args'][
            'peak_reserved'] if 'peak_reserved' in json_obj['args'] else 0
        return self

    @classmethod
    def from_protobuf(cls, obj):
        self = cls()
        self.type = str(obj.type).split('.')[1]
        self.timestamp_ns = obj.timestamp_ns
        self.addr = hex(int(obj.addr))
        self.process_id = obj.process_id
        self.thread_id = obj.thread_id
        self.increase_bytes = obj.increase_bytes
        self.place = obj.place
        self.current_allocated = obj.current_allocated
        self.current_reserved = obj.current_reserved
        self.peak_allocated = obj.peak_allocated
        self.peak_reserved = obj.peak_reserved
        return self


class DeviceNode:
    def __init__(self):
        self.name = None
        self.type = None
        self.start_ns = 0
        self.end_ns = 0
        self.device_id = 0
        self.stream_id = 0
        self.context_id = 0
        self.correlation_id = 0
        self.block_x, self.block_y, self.block_z = [0, 0, 0]
        self.grid_x, self.grid_y, self.grid_z = [0, 0, 0]
        self.shared_memory = 0
        self.registers_per_thread = 0
        self.num_bytes = 0
        self.value = 0
        self.occupancy = 0
        self.blocks_per_sm = 0
        self.warps_per_sm = 0

    @classmethod
    def from_json(cls, json_obj):
        self = cls()
        self.name = json_obj['name'].replace(
            _show_name_pattern.match(json_obj['name']).group(2), "")
        self.type = json_obj['cat']
        self.start_ns = int(
            float(json_obj['args']['start_time'].split(' ')[0]) * 1000)
        self.end_ns = int(
            float(json_obj['args']['end_time'].split(' ')[0]) * 1000)
        self.device_id = json_obj['pid']
        self.stream_id = json_obj['tid']
        self.context_id = json_obj['args']['context'] if 'context' in json_obj[
            'args'] else 0
        self.correlation_id = json_obj['args']['correlation id']
        self.block_x, self.block_y, self.block_z = json_obj['args'][
            'block'] if 'block' in json_obj['args'] else [0, 0, 0]
        self.grid_x, self.grid_y, self.grid_z = json_obj['args'][
            'grid'] if 'grid' in json_obj['args'] else [0, 0, 0]
        self.shared_memory = json_obj['args'][
            'shared memory'] if 'shared memory' in json_obj['args'] else 0
        self.registers_per_thread = json_obj['args'][
            'registers per thread'] if 'registers per thread' in json_obj[
                'args'] else 0
        self.num_bytes = json_obj['args']['bytes'] if 'bytes' in json_obj[
            'args'] else 0
        self.value = json_obj['args']['value'] if 'value' in json_obj[
            'args'] else 0
        self.occupancy = json_obj['args'][
            'theoretical achieved occupancy %'] if 'theoretical achieved occupancy %' in json_obj[
                'args'] else 0
        self.blocks_per_sm = json_obj['args'][
            "blocks per SM"] if "blocks per SM" in json_obj['args'] else 0
        self.warps_per_sm = json_obj['args'][
            "warps per SM"] if "warps per SM" in json_obj['args'] else 0
        return self

    @classmethod
    def from_protobuf(cls, obj):
        self = cls()
        self.name = obj.name
        self.type = str(obj.type).split('.')[1]
        self.start_ns = obj.start_ns
        self.end_ns = obj.end_ns
        self.device_id = obj.device_id
        self.stream_id = obj.stream_id
        self.context_id = obj.context_id
        self.correlation_id = obj.correlation_id
        self.block_x, self.block_y, self.block_z = [
            obj.block_x, obj.block_y, obj.block_z
        ]
        self.grid_x, self.grid_y, self.grid_z = [
            obj.grid_x, obj.grid_y, obj.grid_z
        ]
        self.shared_memory = obj.shared_memory
        self.registers_per_thread = obj.registers_per_thread
        self.num_bytes = obj.num_bytes
        self.value = obj.value
        self.occupancy = obj.occupancy * 100
        self.blocks_per_sm = obj.blocks_per_sm
        self.warps_per_sm = obj.warps_per_sm
        return self


class ProfilerResult:
    def __init__(self, data):
        self.device_infos = None
        self.span_idx = None
        self.data = None
        self.extra_info = None
        self.schema_version = None
        self.has_hostnodes = True
        self.has_devicenodes = True
        self.has_memnodes = True
        self.start_in_timeline_ns = None
        if isinstance(data, dict):
            self.parse_json(data)
            self.content = data
        else:
            self.parse_protobuf(data)
            with tempfile.NamedTemporaryFile("r") as fp:
                data.save(fp.name, "json")
                fp.seek(0)
                self.content = json.loads(fp.read())

    def parse_json(self, json_data):
        self.schema_version = json_data['schemaVersion']
        self.span_idx = json_data['span_indx']
        try:
            self.device_infos = {
                device_info['id']: device_info
                for device_info in json_data['deviceProperties']
            }
        except Exception:
            print(
                "paddlepaddle-gpu version is needed to get GPU device informations."
            )
            self.device_infos = {}
        hostnodes = []
        runtimenodes = []
        devicenodes = []
        memnodes = []
        for event in json_data['traceEvents']:
            if not event or (event['ph'] != 'X' and event['ph'] != 'i'):
                continue
            if event['cat'] in host_node_type_map:
                if event['cat'] == 'CudaRuntime' or event[
                        'cat'] == 'MluRuntime':
                    runtimenodes.append(HostNode.from_json(event))
                else:
                    hostnodes.append(HostNode.from_json(event))
                    if hostnodes[-1].start_ns == 0:
                        self.start_in_timeline_ns = int(event['ts']) * 1000
            elif event['cat'] in device_node_type_map:
                devicenodes.append(DeviceNode.from_json(event))
            elif event['cat'] in memory_node_event_map:
                memnodes.append(MemNode.from_json(event))
        if memnodes:
            for memnode in memnodes:
                assert self.start_in_timeline_ns is not None
                memnode.timestamp_ns = memnode.timestamp_ns - self.start_in_timeline_ns
        if not hostnodes:
            self.has_hostnodes = False
        if not devicenodes:
            self.has_devicenodes = False
        if not memnodes:
            self.has_memnodes = False

        self.data = self.build_tree(hostnodes, runtimenodes, devicenodes,
                                    memnodes)
        self.extra_info = json_data['ExtraInfo']

    def parse_protobuf(self, protobuf_data):  # noqa: C901
        self.schema_version = protobuf_data.get_version()
        self.span_idx = str(protobuf_data.get_span_indx())
        try:
            self.device_infos = {
                device_id: {
                    'name': device_property.name,
                    'totalGlobalMem': device_property.total_memory,
                    'computeMajor': device_property.major,
                    'computeMinor': device_property.minor
                }
                for device_id, device_property in
                protobuf_data.get_device_property().items()
            }
        except Exception:
            print(
                "paddlepaddle-gpu version is needed to get GPU device informations."
            )
            self.device_infos = {}
        self.extra_info = protobuf_data.get_extra_info()
        self.start_in_timeline_ns = float('inf')
        self.has_hostnodes = False
        self.has_devicenodes = False
        self.has_memnodes = False
        node_trees = protobuf_data.get_data()
        new_node_trees = {}
        for threadid, root in node_trees.items():
            stack = []
            new_stack = []
            new_root = HostNode.from_protobuf(root)
            new_node_trees[threadid] = new_root
            stack.append(root)
            new_stack.append(new_root)
            while stack:
                current_node = stack.pop()
                new_current_node = new_stack.pop()
                for child_node in current_node.children_node:
                    if self.has_hostnodes is False:
                        self.has_hostnodes = True
                    new_child_node = HostNode.from_protobuf(child_node)
                    new_current_node.children_node.append(new_child_node)
                    stack.append(child_node)
                    new_stack.append(new_child_node)
                for runtime_node in current_node.runtime_node:
                    new_runtime_node = HostNode.from_protobuf(runtime_node)
                    new_current_node.runtime_node.append(new_runtime_node)
                    for device_node in runtime_node.device_node:
                        new_device_node = DeviceNode.from_protobuf(device_node)
                        new_runtime_node.device_node.append(new_device_node)
                for mem_node in current_node.mem_node:
                    new_mem_node = MemNode.from_protobuf(mem_node)
                    new_current_node.mem_node.append(new_mem_node)
        new_node_tree_list = traverse_tree(new_node_trees)
        for threadid, node_tree_list in new_node_tree_list.items():
            for node in node_tree_list[1:]:  # skip root
                if node.start_ns < self.start_in_timeline_ns:
                    self.start_in_timeline_ns = node.start_ns
        for threadid, node_tree_list in new_node_tree_list.items():
            for node in node_tree_list:
                if node != node_tree_list[0]:  # skip root
                    node.start_ns -= self.start_in_timeline_ns
                    node.end_ns -= self.start_in_timeline_ns
                for runtimenode in node.runtime_node:
                    runtimenode.end_ns -= self.start_in_timeline_ns
                    runtimenode.start_ns -= self.start_in_timeline_ns
                    for device_node in runtimenode.device_node:
                        if self.has_devicenodes is False:
                            self.has_devicenodes = True
                        device_node.start_ns -= self.start_in_timeline_ns
                        device_node.end_ns -= self.start_in_timeline_ns
                for mem_node in node.mem_node:
                    if self.has_memnodes is False:
                        self.has_memnodes = True
                    mem_node.timestamp_ns -= self.start_in_timeline_ns
        self.data = new_node_trees

    def build_tree(  # noqa: C901
            self, hostnodes, runtimenodes, devicenodes, memnodes):
        thread2host_event_nodes = collections.defaultdict(list)
        thread2runtime_event_nodes = collections.defaultdict(list)
        thread2mem_event_nodes = collections.defaultdict(list)
        correlation_id2runtime_event_node = {}
        thread_event_trees = {}
        thread_ids = set()
        for hostnode in hostnodes:
            thread2host_event_nodes[hostnode.thread_id].append(hostnode)
            thread_ids.add(hostnode.thread_id)
        # construct thread2runtime_event_nodes and correlation_id2runtime_event_node
        for runtimenode in runtimenodes:
            thread2runtime_event_nodes[runtimenode.thread_id].append(
                runtimenode)
            thread_ids.add(runtimenode.thread_id)
            correlation_id2runtime_event_node[
                runtimenode.correlation_id] = runtimenode

        # associate CudaRuntimeTraceEventNode and DeviceTraceEventNode
        # construct correlation_id2device_event_nodes
        for devicenode in devicenodes:
            if devicenode.correlation_id not in correlation_id2runtime_event_node:
                continue
            runtimenode = correlation_id2runtime_event_node[
                devicenode.correlation_id]
            runtimenode.device_node.append(devicenode)

        # construct thread2mem_event_nodes
        for memnode in memnodes:
            thread2mem_event_nodes[memnode.thread_id].append(memnode)
        # sort host event nodes and runtime event nodes according to start_ns and
        # end_ns
        # the smaller start_ns is, the further ahead position is.
        # when start_ns of two nodes are equal, the one with bigger end_ns should be
        # ahead.

        def compare_hostnode_func(hostnode1, hostnode2):
            if hostnode1.start_ns < hostnode2.start_ns:
                return -1
            if hostnode1.start_ns == hostnode2.start_ns:
                if hostnode1.end_ns > hostnode2.end_ns:
                    return -1
            return 1

        def compare_memnode_func(memnode1, memnode2):
            if memnode1.timestamp_ns <= memnode2.timestamp_ns:
                return -1
            return 1

        for threadid, hostnodes in thread2host_event_nodes.items():
            thread2host_event_nodes[threadid] = sorted(
                hostnodes, key=functools.cmp_to_key(compare_hostnode_func))
        for threadid, runtimenodes in thread2runtime_event_nodes.items():
            thread2runtime_event_nodes[threadid] = sorted(
                runtimenodes, key=functools.cmp_to_key(compare_hostnode_func))
        for threadid, memnodes in thread2mem_event_nodes.items():
            thread2mem_event_nodes[threadid] = sorted(
                memnodes, key=functools.cmp_to_key(compare_memnode_func))

        # construct trees
        for threadid in thread_ids:
            thread_event_trees[threadid] = self._build_tree_relationship(
                thread2host_event_nodes[threadid],
                thread2runtime_event_nodes[threadid],
                thread2mem_event_nodes[threadid])

        return thread_event_trees

    def _build_tree_relationship(  # noqa: C901
            self, host_event_nodes, runtime_event_nodes, mem_event_nodes):
        # root node
        root_node = HostNode()
        root_node.name, root_node.type, root_node.start_ns, root_node.end_ns = "root node", "UserDefined", \
            0, sys.maxsize
        # push root node into node_stack
        node_stack = []
        node_stack.append(root_node)
        # handle host_event_nodes
        for host_node in host_event_nodes:
            while True:
                stack_top_node = node_stack[-1]
                if host_node.start_ns < stack_top_node.end_ns:
                    stack_top_node.children_node.append(host_node)
                    node_stack.append(host_node)
                    break
                else:
                    node_stack.pop()
                    # insert runtime node
                    # select runtime nodes which time range within stack_top_node
                    hasenter = False
                    firstposition = 0
                    lastposition = len(runtime_event_nodes)
                    for i, runtimenode in enumerate(runtime_event_nodes):
                        if runtimenode.start_ns >= stack_top_node.start_ns and \
                                runtimenode.end_ns <= stack_top_node.end_ns:
                            if not hasenter:
                                firstposition = i
                                hasenter = True
                            stack_top_node.runtime_node.append(runtimenode)
                        else:
                            # from this runtime node, not within stack_top_node, erase the
                            # nodes from runtime_event_nodes
                            if runtimenode.start_ns > stack_top_node.end_ns:
                                lastposition = i
                                break
                    if hasenter:
                        del runtime_event_nodes[firstposition:lastposition]
        # to insert left runtimenode into host_event_nodes
        while node_stack:
            stack_top_node = node_stack.pop()
            # insert runtime node
            # select runtime nodes which time range within stack_top_node
            firstposition = 0
            lastposition = len(runtime_event_nodes)
            hasenter = False
            for i, runtimenode in enumerate(runtime_event_nodes):
                if runtimenode.start_ns >= stack_top_node.start_ns and runtimenode.end_ns <= stack_top_node.end_ns:
                    if not hasenter:
                        firstposition = i
                        hasenter = True
                    stack_top_node.runtime_node.append(runtimenode)
                else:
                    # from this runtime node, not within stack_top_node, erase the
                    # nodes from runtime_event_nodes
                    if runtimenode.start_ns > stack_top_node.end_ns:
                        lastposition = i
                        break
            if hasenter:
                del runtime_event_nodes[firstposition:lastposition]

        # build relationship between host event node and mem event node
        # First, post-order traverse the tree. Then, insert the memory and op
        # supplement node into correct host nodes.
        stack = []
        flag_stack = []
        post_order_nodes = []
        stack.append(root_node)
        flag_stack.append(0)
        while stack:
            current_node = stack.pop()
            flag = flag_stack.pop()
            if flag == 0:
                stack.append(current_node)
                flag_stack.append(1)
                for child in current_node.children_node[::-1]:
                    stack.append(child)
                    flag_stack.append(0)
            else:
                post_order_nodes.append(current_node)
        for node in post_order_nodes:
            hasenter = False
            firstposition = 0
            lastposition = len(mem_event_nodes)
            for i, mem_node in enumerate(mem_event_nodes):
                if mem_node.timestamp_ns >= node.start_ns and mem_node.timestamp_ns <= node.end_ns:
                    node.mem_node.append(mem_node)
                    if not hasenter:
                        firstposition = i
                        hasenter = True
                else:
                    if mem_node.timestamp_ns > node.end_ns:
                        lastposition = i
                        break
            if hasenter:
                del mem_event_nodes[firstposition:lastposition]

        return root_node

    def get_data(self):
        return self.data

    def get_extra_info(self):
        return self.extra_info

    def get_schema_version(self):
        return self.schema_version

    def get_device_infos(self):
        return self.device_infos

    def get_span_idx(self):
        return self.span_idx

    def has_device(self):
        return self.has_devicenodes

    def has_host(self):
        return self.has_hostnodes

    def has_memory(self):
        return self.has_memnodes

    def save(self, path, format):
        pass


def load_profiler_json(file_name):
    content = json.load(open(file_name, 'r'))
    return ProfilerResult(content)
