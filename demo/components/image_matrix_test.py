# Copyright (c) 2021 VisualDL Authors. All Rights Reserve.
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

# coding=utf-8

import numpy as np
from PIL import Image
from visualdl import LogWriter


def random_crop(img):
    """Get random block of img, which size is 100x100.
    """
    img = Image.open(img)
    w, h = img.size
    random_w = np.random.randint(0, w - 100)
    random_h = np.random.randint(0, h - 100)
    r = img.crop((random_w, random_h, random_w + 100, random_h + 100))
    return np.asarray(r)


if __name__ == '__main__':
    imgs = []
    # 获取8张图像
    for step in range(8):
        img = random_crop("../../docs/images/dog.jpg")
        imgs.append(img)
    imgs = np.array(imgs)

    with LogWriter(logdir='./log/image_matrix_test/train') as writer:
        writer.add_image(tag='doges', step=0, img=imgs[0])
        # 合成长宽尽量接近的图形矩阵，本例生成3X3的矩阵
        writer.add_image_matrix(tag='doges', step=1, imgs=imgs, rows=-1)
        # 合成长为1的图形矩阵，本例生成1x8的矩阵
        writer.add_image_matrix(tag='doges', step=2, scale=10, imgs=imgs, rows=1)
        # 合成长为2的图形矩阵，本例生成2X4的矩阵
        writer.add_image_matrix(tag='doges', step=3, scale=10, imgs=imgs, rows=2)
        # 合成长为3的图形矩阵，本例生成3X3的矩阵
        writer.add_image_matrix(tag='doges', step=4, imgs=imgs, rows=3)
        # 合成长为4的图形矩阵，本例生成4X2的矩阵
        writer.add_image_matrix(tag='doges', step=5, imgs=imgs, rows=4)
