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
import re
from multiprocessing import Process
from multiprocessing import Queue
from threading import Lock
from threading import Thread

import packaging.version

from .parser.const_description import *  # noqa: F403
from .parser.event_node import load_profiler_json
from .parser.event_node import ProfilerResult
from .parser.utils import RedirectStdStreams
from .run_manager import RunManager
from visualdl.io import bfile

_name_pattern = re.compile(r"(.+)_time_(.+)\.paddle_trace\.((pb)|(json))")
_lock = Lock()


def is_VDLProfiler_file(path):
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


class ProfilerReader(object):
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
        self.profile_result_queue = Queue()
        self.tempfile = None
        if logdir:
            self.runs()
            Thread(target=self._get_data_from_queue, args=()).start()

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
        if run in self.run_managers:
            self.run_managers[run].join()
            return self.run_managers[run]
        else:
            return None

    def component_tabs(self, update=False):
        """Get component tabs used by vdl frontend.
        """
        component_tabs = set()
        if not self.logdir:
            return component_tabs
        if update is True:
            self.runs(update=update)
        if self.walks:
            component_tabs.add('profiler')
        return component_tabs

    def profile_runs(self, update=False):
        """Get profile run files.

        Every dir(means `run` in vdl) has may have more than one profiler file.

        Returns:
            walks: A dict like {"exp1": ["1587375595_paddle_trace.json", "1587375685_paddle_trace.json"],
                                "exp2": ["1587375686_paddle_trace.json"]}
        """
        if not self.walks or update is True:
            flush_walks = self.get_all_walk()

            walks_temp = {}
            for run, filenames in flush_walks.items():
                tags_temp = [
                    filename for filename in filenames
                    if is_VDLProfiler_file(filename)
                ]
                if len(tags_temp) > 0:
                    walks_temp.update({run: tags_temp})
            self.walks = walks_temp
        return self.walks

    def runs(self, update=True):
        self.profile_runs(update=update)
        for run, filenames in self.walks.items():
            if run not in self.run_managers:
                self.run_managers[run] = RunManager(run)
            self.run_managers[run].set_all_filenames(filenames)
            for filename in filenames:
                with _lock:  # we add this to prevent parallel requests for handling a file multiple times
                    if self.run_managers[run].has_handled(filename):
                        continue
                    self.run_managers[run].handled_filenames.add(filename)
                self._read_data(run, filename)
        return list(self.walks.keys())

    def get_descriptions(self, lang):
        if lang == 'zh':
            return {
                "overview_environment": TOOLTIP_DEVICE_INFO_CN,  # noqa: F405
                "overview_model_perspective":
                TOOLTIP_MODEL_PERSPECTIVE_CN,  # noqa: F405
                "overview_model_perspective_perstep":
                TOOLTIP_MODEL_PERSPECTIVE_PERSTEP_CN,  # noqa: F405
                "overview_event_type_perspective":
                TOOLTIP_EVENT_TYPE_PERSPECTIVE_CN,  # noqa: F405
                "overview_event_type_model_perspective":
                TOOLTIP_EVENT_TYPE_MODEL_PERSPECTIVE_CN,  # noqa: F405
                "distributed_histogram":
                TOOLTIP_EVENT_DISTRIBUTED_HISTOGRAM_CN  # noqa: F405
            }
        else:
            return {
                "overview_environment": TOOLTIP_DEVICE_INFO_EN,  # noqa: F405
                "overview_model_perspective":
                TOOLTIP_MODEL_PERSPECTIVE_EN,  # noqa: F405
                "overview_model_perspective_perstep":
                TOOLTIP_MODEL_PERSPECTIVE_PERSTEP_EN,  # noqa: F405
                "overview_event_type_perspective":
                TOOLTIP_EVENT_TYPE_PERSPECTIVE_EN,  # noqa: F405
                "overview_event_type_model_perspective":
                TOOLTIP_EVENT_TYPE_MODEL_PERSPECTIVE_EN,  # noqa: F405
                "distributed_histogram":
                TOOLTIP_EVENT_DISTRIBUTED_HISTOGRAM_EN  # noqa: F405
            }

    def set_displayname(self, log_reader):
        self.displayname2runs = log_reader.name2tags
        self.runs2displayname = log_reader.tags2name

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass

    def _get_data_from_queue(self):
        while True:
            try:
                run, filename, worker_name, profile_result = self.profile_result_queue.get(
                )
                self.run_managers[run].add_profile_result(
                    filename, worker_name, profile_result)
            except Exception as e:
                print('Read profiler data error in multiprocess, error: {}'.
                      format(e))

    def _read_data(self, run, filename):
        match = _name_pattern.match(filename)
        if match:
            worker_name = match.group(1)
            if '.pb' in filename:

                def _load_profiler_protobuf(run, filename, worker_name):
                    devnull = open(os.devnull, 'w+')
                    with RedirectStdStreams(stdout=devnull, stderr=devnull):
                        try:
                            import paddle
                        except Exception as e:
                            print('Paddle is required to read protobuf file. "\
                                "Please install [paddlepaddle](https://www.paddlepaddle.org.cn/install/quick?"\
                                    "docurl=/documentation/docs/zh/develop/install/pip/linux-pip.html) first.'
                                  )
                            raise RuntimeError(str(e))
                        if packaging.version.parse(
                                '2.4.0') > packaging.version.parse(
                                    paddle.__version__):
                            raise RuntimeError(
                                "Please make sure paddlepaddle version >= 2.4.0"
                            )
                        from paddle.profiler import load_profiler_result
                        try:

                            content = load_profiler_result(
                                os.path.join(run, filename))
                            if content is None:
                                raise RuntimeError("Missing required fields.")
                            profile_result = ProfilerResult(content)
                        except Exception as e:
                            raise RuntimeError(
                                "An error occurred while loading the protobuf file, which may be caused "
                                "by the outdated version of paddle that generated the profile file. "
                                "Please make sure protobuf file is exported by paddlepaddle version >= 2.4.0. "
                                "Error message: {}".format(e))
                        self.profile_result_queue.put(
                            (run, filename, worker_name, profile_result))

                Process(
                    target=_load_profiler_protobuf,
                    args=(run, filename, worker_name)).start()
            else:

                def _load_profiler_json(run, filename, worker_name):
                    profile_result = load_profiler_json(
                        os.path.join(run, filename))
                    self.profile_result_queue.put((run, filename, worker_name,
                                                   profile_result))

                Process(
                    target=_load_profiler_json,
                    args=(run, filename, worker_name)).start()
