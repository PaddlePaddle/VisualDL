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


class MemoryItem:
    def __init__(self, event_name, place, memory_type='Allocated'):
        self.event_name = event_name
        self.place = place
        self.allocation_count = 0
        self.free_count = 0
        self.allocation_size = 0
        self.free_size = 0
        self.increase_size = 0
        self.memory_type = memory_type

    def add_memory_record(self, size, allocation_type):
        if allocation_type == 'Allocate' or allocation_type == 'ReservedAllocate':
            self.allocation_count += 1
            self.allocation_size += size

        elif allocation_type == 'Free' or allocation_type == 'ReservedFree':
            self.free_count += 1
            self.free_size -= size  # size is sign(-) when free.

        else:
            print("No corresponding type.")
        self.increase_size = self.allocation_size - self.free_size


class MemoryParser:
    def __init__(self):
        self.allocated_items = collections.defaultdict(
            dict)  # for memory summary, device type: event
        self.reserved_items = collections.defaultdict(
            dict)  # for memory summary, device type: event
        self.peak_allocation_values = collections.defaultdict(int)
        self.peak_reserved_values = collections.defaultdict(int)
        self.memory_events = collections.defaultdict(
            collections.defaultdict(list)
        )  # device type: (addr, memory_type) : [(timestamp, type, hostnodename, memory_value), (as front)]
        self.memory_curve = collections.defaultdict(
            defaultdict(list)
        )  # device type: Allocated, Reserved, PeakAllocated, PeakReserved : (timestamp, hostnodename, memory_value)

    def parse(self, nodetrees):
        r"""
        Analyse memory event in the nodetress.
        """
        thread2hostnodes = traverse_tree(nodetrees)
        for threadid, host_nodes in thread2hostnodes.items():
            for host_node in host_nodes[1:]:  #skip root node
                if host_node.type == TracerEventType.OperatorInner:
                    continue
                if host_node.type == TracerEventType.Operator:
                    for child in host_node.children_node:
                        self._analyse_node_memory(host_node.name, child)
                self._analyse_node_memory(host_node.name, host_node)

        # To do: pair for memory events

    def _analyse_node_memory(self, event_name, node):
        for memnode in node.mem_node:  # self mem node
            if memnode.type == 'Allocate' or memnode.type == 'Free':
                if event_name not in self.allocated_items[memnode.place]:
                    self.allocated_items[
                        memnode.place][event_name] = MemoryItem(
                            event_name, memnode.place, 'Allocated')
                self.allocated_items[
                    memnode.place][event_name].add_memory_record(
                        memnode.increase_bytes, memnode.type)
                self.memory_events[memnode.place][(memnode.addr,
                                                   'Allocated')].append([
                                                       memnode.timestamp_ns,
                                                       memnode.type,
                                                       event_name,
                                                       memnode.increase_bytes
                                                   ])

            elif memnode.type == 'ReservedAllocate' or memnode.type == 'ReservedFree':
                if event_name not in self.reserved_items[memnode.place]:
                    self.reserved_items[
                        memnode.place][event_name] = MemoryItem(
                            event_name, memnode.place, 'Reserved')
                self.reserved_items[
                    memnode.place][event_name].add_memory_record(
                        memnode.increase_bytes, memnode.type)
                self.memory_events[memnode.place][(memnode.addr,
                                                   "Reserved")].append([
                                                       memnode.timestamp_ns,
                                                       memnode.type,
                                                       event_name,
                                                       memnode.increase_bytes
                                                   ])
            self.memory_curve[memnode.place]['Allocated'] = (
                memnode.timestamp_ns, memnode.current_allocated, event_name)
            self.memory_curve[memnode.place]['Reserved'] = (
                memnode.timestamp_ns, memnode.current_reserved, event_name)
            self.memory_curve[memnode.place]['PeakAllocated'] = (
                memnode.timestamp_ns, memnode.peak_allocated, event_name)
            self.memory_curve[memnode.place]['PeakReserved'] = (
                memnode.timestamp_ns, memnode.peak_reserved, event_name)
            self.peak_allocation_values[memnode.place] = max(
                self.peak_allocation_values[memnode.place],
                memnode.peak_allocated)
            self.peak_reserved_values[memnode.place] = max(
                self.peak_reserved_values[memnode.place],
                memnode.peak_reserved)
