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


if __name__ == '__main__':
    imgs = []
    # 获取6张图像
    for index in range(6):
        imgs.append(np.asarray(Image.open("../../docs/images/images_matrix/%s.jpg" % str((index)))))

    with LogWriter(logdir='./log/image_matrix_test/train') as writer:
        writer.add_image(tag='detection', step=0, img=imgs[0])
        # 合成长宽尽量接近的图形矩阵，本例生成3X3的矩阵
        writer.add_image_matrix(tag='detection', step=1, imgs=imgs, rows=-1)
        # 合成长为1的图形矩阵，本例生成1x8的矩阵
        writer.add_image_matrix(tag='detection', step=2, imgs=imgs, rows=1)
        # 合成长为2的图形矩阵，本例生成2X4的矩阵
        writer.add_image_matrix(tag='detection', step=3, imgs=imgs, rows=2)
        # 合成长为3的图形矩阵，本例生成3X3的矩阵
        writer.add_image_matrix(tag='detection', step=4, imgs=imgs, rows=3)
        # 合成长为4的图形矩阵，本例生成4X2的矩阵，自动补充子图像填充第四行
        writer.add_image_matrix(tag='detection', step=5, imgs=imgs, rows=4)
