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
from visualdl.proto.record_pb2 import Record
import numpy as np
import cv2
from PIL import Image


def scalar(tag, value, step, walltime=None):
    """Package data to one scalar.

    Args:
        tag (string): Data identifier
        value (float): Value of scalar
        step (int): Step of scalar
        walltime (int): Wall time of scalar

    Return:
        Package with format of record_pb2.Record
    """
    value = float(value)
    return Record(values=[
        Record.Value(id=step, tag=tag, timestamp=walltime, value=value)
    ])


def imgarray2bytes(np_array):
    """Convert image ndarray to bytes.

    Args:
        np_array (numpy.ndarray): Array to converte.

    Returns:
        Binary bytes of np_array.
    """
    np_array = cv2.cvtColor(np_array, cv2.COLOR_BGR2RGB)
    ret, buf = cv2.imencode(".png", np_array)

    img_bin = Image.fromarray(np.uint8(buf)).tobytes("raw")
    return img_bin


def image(tag, image_array, step, walltime=None):
    """Package data to one image.

    Args:
        tag (string): Data identifier
        image_array (numpy.ndarray): Value of iamge
        step (int): Step of image
        walltime (int): Wall time of image

    Return:
        Package with format of record_pb2.Record
    """
    image_bytes = imgarray2bytes(image_array)
    image = Record.Image(encoded_image_string=image_bytes)
    return Record(values=[
        Record.Value(id=step, tag=tag, timestamp=walltime, image=image)
    ])


def embedding(tag, labels, hot_vectors, step, walltime=None):
    """Package data to one embedding.

    Args:
        tag (string): Data identifier
        labels (numpy.array or list): A list of labels.
        hot_vectors (numpy.array or list): A matrix which each row is
            feature of labels.
        step (int): Step of embeddings.
        walltime (int): Wall time of embeddings.

    Return:
        Package with format of record_pb2.Record
    """
    embeddings = Record.Embeddings()

    for index in range(len(hot_vectors)):
        embeddings.embeddings.append(
            Record.Embedding(label=labels[index], vectors=hot_vectors[index]))

    return Record(values=[
        Record.Value(
            id=step, tag=tag, timestamp=walltime, embeddings=embeddings)
    ])


def audio(tag, audio_array, sample_rate, step, walltime):
    """Package data to one audio.

    Args:
        tag (string): Data identifier
        audio_array (numpy.ndarray or list): audio represented by a numpy.array
        sample_rate (int): Sample rate of audio
        step (int): Step of audio
        walltime (int): Wall time of audio

    Return:
        Package with format of record_pb2.Record
    """
    import io
    import wave

    fio = io.BytesIO()
    wave_writer = wave.open(fio, 'wb')
    wave_writer.setnchannels(1)
    wave_writer.setsampwidth(2)
    wave_writer.setframerate(sample_rate)
    wave_writer.writeframes(audio_array)
    wave_writer.close()
    audio_string = fio.getvalue()
    fio.close()
    audio_data = Record.Audio(
        sample_rate=sample_rate,
        num_channels=1,
        length_frames=len(audio_array),
        encoded_audio_string=audio_string,
        content_type='audio/wav')
    return Record(values=[
        Record.Value(id=step, tag=tag, timestamp=walltime, audio=audio_data)
    ])


def histogram(tag, hist, bin_edges, step, walltime):
    """Package data to one histogram.

    Args:
        tag (string): Data identifier
        hist (numpy.ndarray or list): The values of the histogram
        bin_edges (numpy.ndarray or list): The bin edges
        step (int): Step of histogram
        walltime (int): Wall time of histogram

    Return:
        Package with format of record_pb2.Record
    """
    histogram = Record.Histogram(hist=hist, bin_edges=bin_edges)
    return Record(values=[
        Record.Value(
            id=step, tag=tag, timestamp=walltime, histogram=histogram)
    ])


def compute_curve(labels, predictions, num_thresholds=None, weights=None):
    """ Compute precision-recall curve data by labels and predictions.

    Args:
        labels (numpy.ndarray or list): Binary labels for each element.
        predictions (numpy.ndarray or list): The probability that an element be
            classified as true.
        num_thresholds (int): Number of thresholds used to draw the curve.
        weights (float): Multiple of data to display on the curve.
    """
    _MINIMUM_COUNT = 1e-7

    if weights is None:
        weights = 1.0

    bucket_indices = np.int32(np.floor(predictions * (num_thresholds - 1)))
    float_labels = labels.astype(np.float)
    histogram_range = (0, num_thresholds - 1)
    tp_buckets, _ = np.histogram(
        bucket_indices,
        bins=num_thresholds,
        range=histogram_range,
        weights=float_labels * weights)
    fp_buckets, _ = np.histogram(
        bucket_indices,
        bins=num_thresholds,
        range=histogram_range,
        weights=(1.0 - float_labels) * weights)

    # Obtain the reverse cumulative sum.
    tp = np.cumsum(tp_buckets[::-1])[::-1]
    fp = np.cumsum(fp_buckets[::-1])[::-1]
    tn = fp[0] - fp
    fn = tp[0] - tp
    precision = tp / np.maximum(_MINIMUM_COUNT, tp + fp)
    recall = tp / np.maximum(_MINIMUM_COUNT, tp + fn)
    data = {
        'tp': tp.astype(int).tolist(),
        'fp': fp.astype(int).tolist(),
        'tn': tn.astype(int).tolist(),
        'fn': fn.astype(int).tolist(),
        'precision': precision.astype(float).tolist(),
        'recall': recall.astype(float).tolist()
    }
    return data


def pr_curve(tag, labels, predictions, step, walltime, num_thresholds=127,
             weights=None):
    """Package data to one pr_curve.

    Args:
        tag (string): Data identifier
        labels (numpy.ndarray or list): Binary labels for each element.
        predictions (numpy.ndarray or list): The probability that an element be
            classified as true.
        step (int): Step of pr_curve
        walltime (int): Wall time of pr_curve
        num_thresholds (int): Number of thresholds used to draw the curve.
        weights (float): Multiple of data to display on the curve.

    Return:
        Package with format of record_pb2.Record
    """
    num_thresholds = min(num_thresholds, 127)
    prcurve_map = compute_curve(labels, predictions, num_thresholds, weights)

    return pr_curve_raw(tag=tag,
                        tp=prcurve_map['tp'],
                        fp=prcurve_map['fp'],
                        tn=prcurve_map['tn'],
                        fn=prcurve_map['fn'],
                        precision=prcurve_map['precision'],
                        recall=prcurve_map['recall'],
                        step=step,
                        walltime=walltime)


def pr_curve_raw(tag, tp, fp, tn, fn, precision, recall, step, walltime):
    """Package raw data to one pr_curve.

    Args:
        tag (string): Data identifier
        tp (list): True Positive.
        fp (list): False Positive.
        tn (list): True Negative.
        fn (list): False Negative.
        precision (list): The fraction of retrieved documents that are relevant
            to the query:
        recall (list): The fraction of the relevant documents that are
            successfully retrieved.
        step (int): Step of pr_curve
        walltime (int): Wall time of pr_curve
        num_thresholds (int): Number of thresholds used to draw the curve.
        weights (float): Multiple of data to display on the curve.

    Return:
        Package with format of record_pb2.Record
    """

    """
    if isinstance(tp, np.ndarray):
        tp = tp.astype(int).tolist()
    if isinstance(fp, np.ndarray):
        fp = fp.astype(int).tolist()
    if isinstance(tn, np.ndarray):
        tn = tn.astype(int).tolist()
    if isinstance(fn, np.ndarray):
        fn = fn.astype(int).tolist()
    if isinstance(precision, np.ndarray):
        precision = precision.astype(int).tolist()
    if isinstance(recall, np.ndarray):
        recall = recall.astype(int).tolist()
    """
    prcurve = Record.PRCurve(TP=tp,
                             FP=fp,
                             TN=tn,
                             FN=fn,
                             precision=precision,
                             recall=recall)
    return Record(values=[
        Record.Value(
            id=step, tag=tag, timestamp=walltime, pr_curve=prcurve)
    ])
