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

from visualdl import LogWriter

if __name__ == '__main__':
    texts = [
        '上联: 众 佛 群 灵 光 圣 地	下联: 众 生 一 念 证 菩 提',
        '上联: 乡 愁 何 处 解	下联: 故 事 几 时 休',
        '上联: 清 池 荷 试 墨	下联: 碧 水 柳 含 情',
        '上联: 既 近 浅 流 安 笔 砚	下联: 欲 将 直 气 定 乾 坤',
        '上联: 日 丽 萱 闱 祝 无 量 寿	下联: 月 明 桂 殿 祝 有 余 龄',
        '上联: 一 地 残 红 风 拾 起	下联: 半 窗 疏 影 月 窥 来'
    ]
    with LogWriter(logdir="./log/text_test/train") as writer:
        for step in range(len(texts)):
            writer.add_text(tag="output", step=step, text_string=texts[step])
