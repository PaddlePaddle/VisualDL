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
import os
import threading
import traceback
from collections import defaultdict
from threading import Thread

import multiprocess
from multiprocess import Process
from multiprocess import Queue

from .parser.event_node import load_profiler_json
from .profile_data import DistributedProfileData
from .profile_data import ProfileData

try:
    from paddle.profiler import load_profiler_result
except:
    print('Load paddle.profiler error. Please check paddle >= 2.3.0')

import re

_name_pattern = re.compile(r"(.+)_time_(.+)\.paddle_trace\.((pb)|(json))")


class RunManager:
    '''
  Manage profile data for each run, each run may have multiple workers and spans.
  We should manage profile data of each (worker, span) unit. 
  Besides, a special worker "all" is created to merge all profile data for distributed view.
  '''

    def __init__(self, run):
        self.run = run
        # worker:
        #   span:
        #       ProfileData
        self.profile_data = defaultdict(dict)
        self.filenames = set()
        # span:
        #       DistributedProfileData
        self.distributed_data = {}

    def get_profile_data(self, worker, span):
        if worker in self.profile_data:
            if span in self.profile_data[worker]:
                return self.profile_data[worker][span]

    def get_distributed_profile_data(self, span):
        if span in self.distributed_data:
            return self.distributed_data[span]

    def get_views(self):
        all_views = set()
        for worker, span_data in self.profile_data.items():
            for span, profiler_data in span_data.items():
                all_views.update(profiler_data.get_views())
        ordered_views = [
            'Overview', 'Operator', 'GPU Kernel', 'Distributed', 'Trace',
            'Memory'
        ]
        final_views = []
        for view in ordered_views:
            if view in all_views:
                final_views.append(view)
        return final_views

    def get_workers(self, view_name):
        workers = []
        for worker, span_data in self.profile_data.items():
            for span, profiler_data in span_data.items():
                if view_name in profiler_data.get_views():
                    workers.append(worker)
                    break
        return workers

    def get_spans(self, worker_name):
        spans = list(self.profile_data[worker_name].keys())
        spans = sorted([int(span) for span in spans])
        spans = [str(span) for span in spans]
        return spans

    def get_distributed_spans(self):
        spans = list(self.distributed_data.keys())
        spans = sorted([int(span) for span in spans])
        spans = [str(span) for span in spans]
        return spans

    def _parse_file(self, filename):
        match = _name_pattern.match(filename)
        if match:
            #print('parse file', filename)
            worker_name = match.group(1)
            if '.pb' in filename:
                result = load_profiler_result(os.path.join(self.run, filename))
            else:
                result = load_profiler_json(os.path.join(self.run, filename))
            span = result.get_span_idx()
            self.profile_data[worker_name][span] = ProfileData(
                self.run, worker_name, span, result)
        return

    def parse_files(self, filenames):
        threads = []
        for filename in filenames:
            if filename not in self.filenames:
                self.filenames.add(filename)
                t = Thread(target=self._parse_file, args=(filename, ))
                t.start()
                threads.append(t)

        #("I am in run_manager begin", self.run)
        for thread in threads:
            thread.join()
        distributed_profile_data = defaultdict(list)
        for worker_name, span_data in self.profile_data.items():
            for span_idx, profile_data in span_data.items():
                distributed_profile_data[span_idx].append(profile_data)
        for span_idx, profile_datas in distributed_profile_data.items():
            self.distributed_data[span_idx] = DistributedProfileData(
                self.run, span_idx, profile_datas)
        #print('I am in run_manager done', self.run, self.get_views())
