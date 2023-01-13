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
import numpy as np

__all__ = [
    'visualize_detection', 'visualize_keypoint_detection',
    'visualize_face_detection', 'visualize_face_alignment',
    'visualize_segmentation', 'visualize_matting', 'visualize_ocr',
    'visualize_headpose'
]


def visualize_detection(image, data):
    try:
        import fastdeploy as fd
    except Exception:
        raise RuntimeError(
            "fastdeploy is required for visualizing results，please refer to "
            "https://github.com/PaddlePaddle/FastDeploy to install fastdeploy")
    boxes = np.array(data['boxes'])
    scores = np.array(data['scores'])
    label_ids = np.array(data['label_ids'])
    masks = np.array(data['masks'])
    contain_masks = data['contain_masks']
    detection_result = fd.C.vision.DetectionResult()
    detection_result.boxes = boxes
    detection_result.scores = scores
    detection_result.label_ids = label_ids
    detection_result.masks = masks
    detection_result.contain_masks = contain_masks
    result = fd.vision.vis_detection(image, detection_result)
    return result


def visualize_keypoint_detection(image, data):
    try:
        import fastdeploy as fd
    except Exception:
        raise RuntimeError(
            "fastdeploy is required for visualizing results，please refer to "
            "https://github.com/PaddlePaddle/FastDeploy to install fastdeploy")
    keypoints = np.array(data['keypoints'])
    scores = np.array(data['scores'])
    num_joints = np.array(data['num_joints'])

    detection_result = fd.C.vision.KeyPointDetectionResult()
    detection_result.keypoints = keypoints
    detection_result.scores = scores
    detection_result.num_joints = num_joints

    result = fd.vision.vis_keypoint_detection(image, detection_result)
    return result


def visualize_face_detection(image, data):
    try:
        import fastdeploy as fd
    except Exception:
        raise RuntimeError(
            "fastdeploy is required for visualizing results，please refer to "
            "https://github.com/PaddlePaddle/FastDeploy to install fastdeploy")
    data = np.array(data['data'])
    scores = np.array(data['scores'])
    landmarks = np.array(data['landmarks'])
    landmarks_per_face = data['landmarks_per_face']

    detection_result = fd.C.vision.FaceDetectionResult()
    detection_result.data = data
    detection_result.scores = scores
    detection_result.landmarks = landmarks
    detection_result.landmarks_per_face = landmarks_per_face

    result = fd.vision.vis_face_detection(image, detection_result)
    return result


def visualize_face_alignment(image, data):
    try:
        import fastdeploy as fd
    except Exception:
        raise RuntimeError(
            "fastdeploy is required for visualizing results，please refer to "
            "https://github.com/PaddlePaddle/FastDeploy to install fastdeploy")
    landmarks = np.array(data['landmarks'])

    facealignment_result = fd.C.vision.FaceAlignmentResult()
    facealignment_result.landmarks = landmarks

    result = fd.vision.vis_face_alignment(image, facealignment_result)
    return result


def visualize_segmentation(image, data):
    try:
        import fastdeploy as fd
    except Exception:
        raise RuntimeError(
            "fastdeploy is required for visualizing results，please refer to "
            "https://github.com/PaddlePaddle/FastDeploy to install fastdeploy")
    label_ids = np.array(data['label_ids'])
    score_map = np.array(data['score_map'])
    shape = np.array(data['shape'])

    segmentation_result = fd.C.vision.SegmentationResult()
    segmentation_result.shape = shape
    segmentation_result.score_map = score_map
    segmentation_result.label_ids = label_ids

    result = fd.vision.vis_segmentation(image, segmentation_result)
    return result


def visualize_matting(image, data):
    try:
        import fastdeploy as fd
    except Exception:
        raise RuntimeError(
            "fastdeploy is required for visualizing results，please refer to "
            "https://github.com/PaddlePaddle/FastDeploy to install fastdeploy")
    alpha = np.array(data['alpha'])
    foreground = np.array(data['foreground'])
    contain_foreground = data['contain_foreground']
    shape = np.array(data['shape'])

    matting_result = fd.C.vision.MattingResult()
    matting_result.alpha = alpha
    matting_result.foreground = foreground
    matting_result.contain_foreground = contain_foreground
    matting_result.shape = shape

    result = fd.vision.vis_matting(image, matting_result)
    return result


def visualize_ocr(image, data):
    try:
        import fastdeploy as fd
    except Exception:
        raise RuntimeError(
            "fastdeploy is required for visualizing results，please refer to "
            "https://github.com/PaddlePaddle/FastDeploy to install fastdeploy")
    boxes = np.array(data['boxes'])
    text = np.array(data['text'])
    rec_scores = np.array(data['rec_scores'])
    cls_scores = np.array(data['cls_scores'])
    cls_labels = data['cls_labels']

    ocr_result = fd.C.vision.OCRResult()
    ocr_result.boxes = boxes
    ocr_result.text = text
    ocr_result.rec_scores = rec_scores
    ocr_result.cls_scores = cls_scores
    ocr_result.cls_labels = cls_labels

    result = fd.vision.vis_ppocr(image, ocr_result)
    return result


def visualize_headpose(image, data):
    try:
        import fastdeploy as fd
    except Exception:
        raise RuntimeError(
            "fastdeploy is required for visualizing results，please refer to "
            "https://github.com/PaddlePaddle/FastDeploy to install fastdeploy")
    euler_angles = np.array(data['euler_angles'])

    headpose_result = fd.C.vision.HeadPoseResult()
    headpose_result.euler_angles = euler_angles

    result = fd.vision.vis_headpose(image, headpose_result)
    return result
