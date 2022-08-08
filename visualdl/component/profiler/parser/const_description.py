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
__ALL__ = [
    'TOOLTIP_DEVICE_INFO_CN', 'TOOLTIP_MODEL_PERSPECTIVE_CN',
    'TOOLTIP_MODEL_PERSPECTIVE_PERSTEP_CN',
    'TOOLTIP_EVENT_TYPE_PERSPECTIVE_CN',
    'TOOLTIP_EVENT_TYPE_MODEL_PERSPECTIVE_CN', 'TOOLTIP_DEVICE_INFO_EN',
    'TOOLTIP_MODEL_PERSPECTIVE_EN', 'TOOLTIP_MODEL_PERSPECTIVE_PERSTEP_EN',
    'TOOLTIP_EVENT_TYPE_PERSPECTIVE_EN',
    'TOOLTIP_EVENT_TYPE_MODEL_PERSPECTIVE_EN'
]

TOOLTIP_DEVICE_INFO_CN = \
  "CPU进程利用率：\n"\
  "\t进程所利用到的CPU的时间 / ProfileStep的时间(即性能分析的时间跨度）"\
  "CPU系统利用率\n"\
  "\t整个系统所有进程利用到的CPU时间 / CPU总时间（ProfileStep的时间*CPU核心数）"\
  "GPU利用率\n"\
  "\t进程利用GPU计算的时间 / ProfileStep的时间，进程利用GPU计算的时间即是GPU Kernel计算的时间，越高越好"\
  "流处理器效率\n"\
  "\t对于流处理器处理某个GPU Kernel, 其效率为SM_Eff_i = min(Kernel所用的Blocks数量 / GPU的流处理器数量, 100%)。"\
  "流处理器效率为SM_Eff_i关于每个Kernel的执行时间加权和 / ProfileStep的时间"\
  "流处理器占用率\n"\
  "\t对于流处理器处理某个GPU Kernel, 其占用率Occu_i = 为活跃的warp数 / 能支持的最大warp数。流处理器占用率为Occu_i关于每个Kernel执行时间的加权平均"\
  "Tensor cores使用时间占比\n"\
  "\t使用Tensor Cores的GPU Kernel的计算时间 / 所有Kernel的计算时间"

TOOLTIP_MODEL_PERSPECTIVE_CN = \
  "展示模型各阶段DataLoader, Forward, Backward, Optimization以及Other的总CPU和GPU时间。\n"\
  "CPU时间即是各阶段代码执行的时间，GPU时间是各阶段所调用的GPU Kernel在GPU上的计算时间。\n"\
  "\t DataLoader: 表示使用paddle.io.DataLoader从数据集中取数据的阶段\n"\
  "\t Forward: 表示模型前向计算的阶段\n"\
  "\t Backward: 表示模型反向梯度计算的阶段\n"\
  "\t Optimization: 表示模型优化更新参数的阶段\n"\
  "\t Other: 其它时间"

TOOLTIP_MODEL_PERSPECTIVE_PERSTEP_CN = \
  "展示每一个ProfileStep内模型各阶段DataLoader, Forward, Backward, Optimization以及Other的CPU和GPU时间。\n"\
  "CPU时间即是各阶段代码执行的时间，GPU时间是各阶段所调用的GPU Kernel在GPU上的计算时间。"\
  "\t DataLoader: 表示使用paddle.io.DataLoader从数据集中取数据的阶段\n"\
  "\t Forward: 表示模型前向计算的阶段\n"\
  "\t Backward: 表示模型反向梯度计算的阶段\n"\
  "\t Optimization: 表示模型优化更新参数的阶段\n"\
  "\t Other: 其它时间"

TOOLTIP_EVENT_TYPE_PERSPECTIVE_CN = \
  "展示不同类型的事件在模型各阶段DataLoader, Forward, Backward, Optimization以及Other的分布。\n"

TOOLTIP_EVENT_TYPE_MODEL_PERSPECTIVE_CN = \
  "展示在模型各阶段DataLoader, Forward, Backward, Optimization以及Other所包含的各种事件的时间。"

TOOLTIP_DEVICE_INFO_EN = \
  "CPU Process Utilization：\n"\
  "\tProcess CPU time / ProfileStep time(total time of profiling）"\
  "CPU System Utilization：\n"\
  "\tSum of system's all processes CPU time/ CPU total time（ProfileStep time* #CPU Core)"\
  "GPU Utilization\n"\
  "\tGPU busy time / ProfileStep time，GPU busy time is the time during in which at least one GPU kernel is\
  running on it."\
  "Est. SM Efficiency\n"\
  "\tThe SM efficiency for one kernel can be denoted as SM_Eff_i = min(blocks of this kernel / SM number \
  of this GPU, 100%)."\
  "Est. SM efficiency of GPU is the weighted sum of SM_Eff_i across all kernels / ProfileStep time"\
  "Est. Achieved Occupancy\n"\
  "\tThe SM occupancy for one kernel can be denoted as Occu_i = active warps on an SM / maximum number \
    of active warps supported by the SM."\
  "Est. SM occupancy of GPU is the weighted average of Occu_i across all kernels"\
  "Tensor cores ratio\n"\
  "\tSum of kernel time using Tensor Cores / Sum of total kernel time"

TOOLTIP_MODEL_PERSPECTIVE_EN = \
  "Present CPU and GPU time for each stage of a model, i.e. DataLoader, Forward, Backward, Optimization and Other.\n"\
  "CPU time is the execution time for code，GPU time is the calculation time of kernels launched in the stage.\n"\
  "\t DataLoader: denote data fetching using paddle.io.DataLoader\n"\
  "\t Forward: denote model forward\n"\
  "\t Backward: denote gradient back-propagate\n"\
  "\t Optimization: denote parameters update\n"\
  "\t Other: other time out of above range"

TOOLTIP_MODEL_PERSPECTIVE_PERSTEP_EN = \
  "Present CPU and GPU time in each ProfileStep for each stage of a model, \
  i.e. DataLoader, Forward, Backward, Optimization and Other.\n"\
  "CPU time is the execution time for code，GPU time is the calculation time of kernels launched in the stage.\n"\
  "\t DataLoader: denote data fetching using paddle.io.DataLoader\n"\
  "\t Forward: denote model forward\n"\
  "\t Backward: denote gradient back-propagate\n"\
  "\t Optimization: denote parameters update\n"\
  "\t Other: other time out of above range"

TOOLTIP_EVENT_TYPE_PERSPECTIVE_EN = \
  "Present the distribution of each kind of events across DataLoader,\
  Forward, Backward, Optimization and Other stage.\n"

TOOLTIP_EVENT_TYPE_MODEL_PERSPECTIVE_EN = \
  "Present the time of each kind of events included in DataLoader, Forward, Backward, Optimization and Other stage."
