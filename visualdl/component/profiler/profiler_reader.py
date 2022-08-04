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
import tempfile
import threading

import multiprocess
from multiprocess import Process
from multiprocess import Queue

from .run_manager import RunManager
from .utils import process_manager
from visualdl.io import bfile


def is_VDLProfile_file(path):
    """Determine whether it is a paddle profile file that can be read by vdl according to the file name.

    File name of a paddle profile file must contain `paddle_trace`.

    Args:
        path: File name to determine.
    Returns:
        True if the file is a paddle profile file, otherwise false.
    """
    if "paddle_trace" not in path:
        return False
    return True


class ProfileReader(object):
    """Profile reader to read paddle profile files, support for frontend api in lib.py.
    """

    def __init__(self, logdir=''):
        """Instance of ProfileReader

        Args:
            logdir: The dir include paddle profile files, multiple subfolders allowed.
        """
        if isinstance(logdir, str):
            self.dir = [logdir]
        else:
            self.dir = logdir

        self.walks = {}
        self.displayname2runs = {}
        self.runs2displayname = {}
        self.run_managers = {}
        self.queue_managers = {}
        self.tempfile = None
        self.runs()

    @property
    def logdir(self):
        return self.dir

    def get_all_walk(self):
        flush_walks = {}
        for dir in self.dir:
            for root, dirs, files in bfile.walk(dir):
                flush_walks.update({root: files})
        return flush_walks

    def get_run_manager(self, run):
        print('get_run_manager:', run)
        while process_manager.get_process(run):
            # print('I am in manager_queue')
            try:
                run_name, run_manager = self.queue_managers[run].get(10)
                print('get from queue', run_name, run_manager)
                print(run_manager.get_views())
                self.run_managers[run_name] = run_manager
                process_manager.get_process(run_name).close()
                process_manager.remove_process(run_name)
                del self.queue_managers[run]
            except:
                break
        # print('I am in get_run_manager')
        if run in self.run_managers:
            return self.run_managers[run]
        else:
            return None

    def profile_runs(self, update=False):
        """Get profile run files.

        Every dir(means `run` in vdl) has may have more than one profiler file.

        Returns:
            walks: A dict like {"exp1": ["1587375595_paddle_trace.pb", "1587375685_paddle_trace.pb"],
                                "exp2": ["1587375686_paddle_trace.pb"]}
        """
        if not self.walks or update is True:
            flush_walks = self.get_all_walk()

            walks_temp = {}
            for run, filenames in flush_walks.items():
                tags_temp = [
                    filename for filename in filenames
                    if is_VDLProfile_file(filename)
                ]
                if len(tags_temp) > 0:
                    walks_temp.update({run: tags_temp})
            self.walks = walks_temp
        return self.walks

    def runs(self, update=True):
        threads = []
        self.profile_runs(update=update)
        for run, filenames in self.walks.items():
            if run not in self.run_managers:
                self.run_managers[run] = RunManager(run)
                manager_queue = Queue()
                t = Process(
                    target=self.run_managers[run].parse_files,
                    args=(
                        manager_queue,
                        filenames,
                    ))
                t.start()
                print(run)
                process_manager.add_process(run, t)
                self.queue_managers[run] = manager_queue
        return list(self.walks.keys())

    def set_displayname(self, log_reader):
        self.displayname2runs = log_reader.name2tags
        self.runs2displayname = log_reader.tags2name

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass
