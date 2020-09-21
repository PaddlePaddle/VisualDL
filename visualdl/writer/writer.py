# Copyright (c) 2020 VisualDL Authors. All Rights Reserve.
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
import time
import numpy as np
from visualdl.writer.record_writer import RecordFileWriter
from visualdl.component.base_component import scalar, image, embedding, audio, histogram, pr_curve, meta_data


class DummyFileWriter(object):
    """A fake file writer that writes nothing to the disk.
    """

    def __init__(self, logdir):
        self._logdir = logdir

    def get_logdir(self):
        """Returns the directory where event file will be written."""
        return self._logdir

    def add_event(self, event, step=None, walltime=None):
        return

    def add_summary(self, summary, global_step=None, walltime=None):
        return

    def add_graph(self, graph_profile, walltime=None):
        return

    def add_onnx_graph(self, graph, walltime=None):
        return

    def flush(self):
        return

    def close(self):
        return

    def reopen(self):
        return


class LogWriter(object):
    """Log writer to write vdl records to log file.

    The class `LogWriter` provides APIs to create record file and add records to
    it. The class updates log file asynchronously without slowing down training.
    """

    def __init__(self,
                 logdir=None,
                 comment='',
                 max_queue=10,
                 flush_secs=120,
                 filename_suffix='',
                 write_to_disk=True,
                 display_name='',
                 file_name='',
                 **kwargs):
        """Create a instance of class `LogWriter` and create a vdl log file with
        given args.

        Args:
            logdir (string): Directory of log file. Default is
                `runs/**current_time**.**comment**`.
            comment (string): Suffix appended to the default `logdir`.It has no
                effect if `logidr` is assigned.
            max_queue (int): Size of queue for pending records.
            flush_secs (int): The duration to flush the pending records in queue
                to disk.
            filename_suffix (string): Suffix added to vdl log file.
            write_to_disk (boolean): Write to disk if it is True.
        """
        if not logdir:
            from datetime import datetime
            current_time = datetime.now().strftime('%b%d_%H-%M-%S')
            if '' != comment:
                comment = '.' + comment
            logdir = os.path.join('runs', current_time + comment)
        self._logdir = logdir
        self._max_queue = max_queue
        self._flush_secs = flush_secs
        self._filename_suffix = filename_suffix
        self._write_to_disk = write_to_disk
        self.kwargs = kwargs
        self._file_name = file_name

        self._file_writer = None
        self._all_writers = {}
        self._get_file_writer()
        self.loggers = {}
        self.add_meta(display_name=display_name)

    @property
    def logdir(self):
        return self._logdir

    def _get_file_writer(self):
        if not self._write_to_disk:
            self._file_writer = DummyFileWriter(logdir=self._logdir)
            self._all_writers.update({self._logdir: self._file_writer})
            return self._file_writer

        if self._all_writers is {} or self._file_writer is None:
            self._file_writer = RecordFileWriter(
                logdir=self._logdir,
                max_queue_size=self._max_queue,
                flush_secs=self._flush_secs,
                filename_suffix=self._filename_suffix,
                filename=self._file_name)
            self._all_writers.update({self._logdir: self._file_writer})
        return self._file_writer

    @property
    def file_name(self):
        return self._file_writer.get_filename()

    def add_meta(self, tag='meta_data_tag', display_name='', step=0, walltime=None):
        """Add a meta to vdl record file.

        Args:
            tag (string): Data identifier
            display_name (string): Display name of `runs`.
            step (int): Step of meta.
            walltime (int): Wall time of scalar
        """
        if '%' in tag:
            raise RuntimeError("% can't appear in tag!")
        walltime = round(time.time() * 1000) if walltime is None else walltime
        self._get_file_writer().add_record(
            meta_data(tag=tag, display_name=display_name, step=step,
                      walltime=walltime))

    def add_scalar(self, tag, value, step, walltime=None):
        """Add a scalar to vdl record file.

        Args:
            tag (string): Data identifier
            value (float): Value of scalar
            step (int): Step of scalar
            walltime (int): Wall time of scalar

        Example:
            for index in range(1, 101):
                writer.add_scalar(tag="train/loss", value=index*0.2, step=index)
                writer.add_scalar(tag="train/lr", value=index*0.5, step=index)
        """
        if '%' in tag:
            raise RuntimeError("% can't appear in tag!")
        walltime = round(time.time() * 1000) if walltime is None else walltime
        self._get_file_writer().add_record(
            scalar(tag=tag, value=value, step=step, walltime=walltime))

    def add_image(self, tag, img, step, walltime=None, dataformats="HWC"):
        """Add an image to vdl record file.

        Args:
            tag (string): Data identifier
            img (numpy.ndarray): Image represented by a numpy.array
            step (int): Step of image
            walltime (int): Wall time of image
            dataformats (string): Format of image

        Example:
            from PIL import Image
            import numpy as np

            I = Image.open("./test.png")
            I_array = np.array(I)
            writer.add_image(tag="lll", img=I_array, step=0)
        """
        if '%' in tag:
            raise RuntimeError("% can't appear in tag!")
        walltime = round(time.time() * 1000) if walltime is None else walltime
        self._get_file_writer().add_record(
            image(tag=tag, image_array=img, step=step, walltime=walltime,
                  dataformats=dataformats))

    def add_embeddings(self, tag, labels, hot_vectors, walltime=None):
        """Add embeddings to vdl record file.

        Args:
            tag (string): Data identifier
            labels (numpy.array or list): A list of labels.
            hot_vectors (numpy.array or list): A matrix which each row is
                feature of labels.
            walltime (int): Wall time of embeddings.

        Example:
            hot_vectors = [
            [1.3561076367500755, 1.3116267195134017, 1.6785401875616097],
            [1.1039614644440658, 1.8891609992484688, 1.32030488587171],
            [1.9924524852447711, 1.9358920727142739, 1.2124401279391606],
            [1.4129542689796446, 1.7372166387197474, 1.7317806077076527],
            [1.3913371800587777, 1.4684674577930312, 1.5214136352476377]]

            labels = ["label_1", "label_2", "label_3", "label_4", "label_5"]

            writer.add_embedding(labels=labels, vectors=hot_vectors,
                                 walltime=round(time.time() * 1000))
        """
        if '%' in tag:
            raise RuntimeError("% can't appear in tag!")
        if isinstance(hot_vectors, np.ndarray):
            hot_vectors = hot_vectors.tolist()
        if isinstance(labels, np.ndarray):
            labels = labels.tolist()
        step = 0
        walltime = round(time.time() * 1000) if walltime is None else walltime
        self._get_file_writer().add_record(
            embedding(
                tag=tag,
                labels=labels,
                hot_vectors=hot_vectors,
                step=step,
                walltime=walltime))

    def add_audio(self,
                  tag,
                  audio_array,
                  step,
                  sample_rate=8000,
                  walltime=None):
        """Add an audio to vdl record file.

        Args:
            tag (string): Data identifier
            audio (numpy.ndarray or list): audio represented by a numpy.array
            step (int): Step of audio
            sample_rate (int): Sample rate of audio
            walltime (int): Wall time of audio

        Example:
            import wave

            CHUNK = 4096
            f = wave.open(audio_path, "rb")
            wavdata = []
            chunk = f.readframes(CHUNK)
            while chunk:
                data = np.frombuffer(chunk, dtype='uint8')
                wavdata.extend(data)
                chunk = f.readframes(CHUNK)
            audio_data = np.array(wavdata)

            writer.add_audio(tag="audio_test",
                             audio_array=audio_data,
                             step=0,
                             sample_rate=8000)
        """
        if '%' in tag:
            raise RuntimeError("% can't appear in tag!")
        walltime = round(time.time() * 1000) if walltime is None else walltime
        if isinstance(audio_array, list):
            audio_array = np.array(audio_array)
        self._get_file_writer().add_record(
            audio(
                tag=tag,
                audio_array=audio_array,
                sample_rate=sample_rate,
                step=step,
                walltime=walltime))

    def add_histogram(self,
                      tag,
                      values,
                      step,
                      walltime=None,
                      buckets=10):
        """Add an histogram to vdl record file.

        Args:
            tag (string): Data identifier
            value (numpy.ndarray or list): value represented by a numpy.array or list
            step (int): Step of histogram
            walltime (int): Wall time of audio
            buckets (int): Number of buckets, default is 10

        Example:
            values = np.arange(0, 1000)
            with LogWriter(logdir="./log/histogram_test/train") as writer:
                for index in range(5):
                    writer.add_histogram(tag='default',
                                         values=values+index,
                                         step=index)
        """
        if '%' in tag:
            raise RuntimeError("% can't appear in tag!")
        hist, bin_edges = np.histogram(values, bins=buckets)
        walltime = round(time.time() * 1000) if walltime is None else walltime
        self._get_file_writer().add_record(
            histogram(
                tag=tag,
                hist=hist,
                bin_edges=bin_edges,
                step=step,
                walltime=walltime))

    def add_pr_curve(self,
                     tag,
                     labels,
                     predictions,
                     step,
                     num_thresholds=10,
                     weights=None,
                     walltime=None):
        """Add an precision-recall curve to vdl record file.

        Args:
            tag (string): Data identifier
            labels (numpy.ndarray or list): Binary labels for each element.
            predictions (numpy.ndarray or list): The probability that an element
                be classified as true.
            step (int): Step of pr curve.
            weights (float): Multiple of data to display on the curve.
            num_thresholds (int): Number of thresholds used to draw the curve.
            walltime (int): Wall time of pr curve.

        Example:
            with LogWriter(logdir="./log/pr_curve_test/train") as writer:
                for index in range(3):
                    labels = np.random.randint(2, size=100)
                    predictions = np.random.rand(100)
                    writer.add_pr_curve(tag='default',
                                        labels=labels,
                                        predictions=predictions,
                                        step=index)
        """
        if '%' in tag:
            raise RuntimeError("% can't appear in tag!")
        walltime = round(time.time() * 1000) if walltime is None else walltime
        self._get_file_writer().add_record(
            pr_curve(
                tag=tag,
                labels=labels,
                predictions=predictions,
                step=step,
                walltime=walltime,
                num_thresholds=num_thresholds,
                weights=weights
                ))

    def flush(self):
        """Flush all data in cache to disk.
        """
        if self._all_writers is {}:
            return
        for writer in self._all_writers.values():
            writer.flush()

    def close(self):
        """Close all writers after flush data to disk.
        """
        if self._all_writers is {}:
            return
        for writer in self._all_writers.values():
            writer.flush()
            writer.close()
        self._file_writer = None
        self._all_writers = {}

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
