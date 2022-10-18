# Copyright (c) 2022 VisualDL Authors. All Rights Reserve.
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
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
  '<b class="bold">CPU进程利用率:</b><br>'\
  '进程所利用到的CPU的时间 / ProfileStep的时间(即性能分析的时间跨度）<br>'\
  '<b class="bold">CPU系统利用率:</b><br>'\
  '整个系统所有进程利用到的CPU时间 / CPU总时间（ProfileStep的时间*CPU核心数）<br>'\
  '<b class="bold">GPU利用率:</b><br>'\
  '进程利用GPU计算的时间 / ProfileStep的时间，进程利用GPU计算的时间即是GPU Kernel计算的时间，越高越好<br>'\
  '<b class="bold">流处理器效率:</b><br>'\
  '对于流处理器处理某个GPU Kernel, 其效率为SM_Eff_i = min(Kernel所用的Blocks数量 / GPU的流处理器数量, 100%)。'\
  '流处理器效率为SM_Eff_i关于每个Kernel的执行时间加权和 / ProfileStep的时间<br>'\
  '<b class="bold">流处理器占用率:</b><br>'\
  '对于流处理器处理某个GPU Kernel, 其占用率Occu_i = 为活跃的warp数 / 能支持的最大warp数。流处理器占用率为Occu_i关于每个Kernel执行时间的加权平均<br>'\
  '<b class="bold">Tensor cores使用时间占比:</b><br>'\
  '使用Tensor Cores的GPU Kernel的计算时间 / 所有Kernel的计算时间<br>'

TOOLTIP_MODEL_PERSPECTIVE_CN = \
  '展示模型各阶段DataLoader, Forward, Backward, Optimization以及Other的总CPU和GPU时间。<br>'\
  'CPU时间即是各阶段代码执行的时间，GPU时间是各阶段所调用的GPU Kernel在GPU上的计算时间。<br>'\
  '<b class="bold">DataLoader:</b> 表示使用paddle.io.DataLoader从数据集中取数据的阶段<br>'\
  '<b class="bold">Forward:</b> 表示模型前向计算的阶段<br>'\
  '<b class="bold">Backward:</b> 表示模型反向梯度计算的阶段<br>'\
  '<b class="bold">Optimization:</b> 表示模型优化更新参数的阶段<br>'\
  '<b class="bold">Other:</b> 其它时间<br>'

TOOLTIP_MODEL_PERSPECTIVE_PERSTEP_CN = \
  '展示每一个ProfileStep内模型各阶段DataLoader, Forward, Backward, Optimization以及Other的CPU和GPU时间。<br>'\
  'CPU时间即是各阶段代码执行的时间，GPU时间是各阶段所调用的GPU Kernel在GPU上的计算时间。<br>'\
  '<b class="bold">DataLoader:</b> 表示使用paddle.io.DataLoader从数据集中取数据的阶段<br>'\
  '<b class="bold">Forward:</b> 表示模型前向计算的阶段<br>'\
  '<b class="bold">Backward:</b> 表示模型反向梯度计算的阶段<br>'\
  '<b class="bold">Optimization:</b> 表示模型优化更新参数的阶段<br>'\
  '<b class="bold">Other:</b> 其它时间<br>'

TOOLTIP_EVENT_TYPE_PERSPECTIVE_CN = \
  '展示不同类型的事件在模型各阶段DataLoader, Forward, Backward, Optimization以及Other的分布。<br>'\
  '<b class="bold">Operator:</b> 表示框架内的算子执行<br>'\
  '<b class="bold">CudaRuntime:</b> 表示cuda runtime的函数执行<br>'\
  '<b class="bold">Kernel:</b> 表示GPU上计算的Kernel函数执行<br>'\
  '<b class="bold">Memcpy:</b> 表示CPU和GPU之间的数据传输<br>'\
  '<b class="bold">Memset:</b> 表示GPU的显存值设置<br>'\
  '<b class="bold">UserDefined:</b> 表示用户在python脚本中自定义的事件<br>'\
  '<b class="bold">OperatorInner:</b> 表示框架内算子的执行子过程<br>'\
  '<b class="bold">Communication:</b> 表示分布式通信有关的事件<br>'

TOOLTIP_EVENT_TYPE_MODEL_PERSPECTIVE_CN = \
  '展示在模型各阶段DataLoader, Forward, Backward, Optimization以及Other所包含的各种事件的时间。<br>'\
  '<b class="bold">Operator:</b> 表示框架内的算子执行<br>'\
  '<b class="bold">CudaRuntime:</b> 表示cuda runtime的函数执行<br>'\
  '<b class="bold">Kernel:</b> 表示GPU上计算的Kernel函数执行<br>'\
  '<b class="bold">Memcpy:</b> 表示CPU和GPU之间的数据传输<br>'\
  '<b class="bold">Memset:</b> 表示GPU的显存值设置<br>'\
  '<b class="bold">UserDefined:</b> 表示用户在python脚本中自定义的事件<br>'\
  '<b class="bold">OperatorInner:</b> 表示框架内算子的执行子过程<br>'\
  '<b class="bold">Communication:</b> 表示分布式通信有关的数据通信和计算事件<br>'

TOOLTIP_EVENT_DISTRIBUTED_HISTOGRAM_CN = \
  '展示模型在每个迭代过程中通信、计算以及两者重叠部分的时间。<br>'\
  '<b class="bold">ProfileStep:</b> 表示某一步迭代的总时间<br>'\
  '<b class="bold">Communication:</b> 表示和通信相关的时间，包括框架内打的Communication事件、和通信有关的算子和Kernel（nccl)执行的时间<br>'\
  '<b class="bold">Computation:</b> 表示GPU Kernel计算的时间，但是去除了和通信有关的Kernel(nccl)<br>'\
  '<b class="bold">Overlap:</b> 表示通信和计算过程并行执行时候时间相互重叠的部分<br>'\
  '<b class="bold">Others:</b> 表示通信和计算之外的时间<br>'

TOOLTIP_DEVICE_INFO_EN = \
  '<b class="bold">CPU Process Utilization:</b><br>'\
  'Process CPU time / ProfileStep time(total time of profiling）<br>'\
  '<b class="bold">CPU System Utilization:</b><br>'\
  'Sum of system\'s all processes CPU time/ CPU total time（ProfileStep time* #CPU Core)<br>'\
  '<b class="bold">GPU Utilization:</b><br>'\
  'GPU busy time / ProfileStep time，GPU busy time is the time during in which at least one GPU kernel is\
  running on it.<br>'\
  '<b class="bold">Est. SM Efficiency:</b><br>'\
  'The SM efficiency for one kernel can be denoted as SM_Eff_i = min(blocks of this kernel / SM number \
  of this GPU, 100%).'\
  'Est. SM efficiency of GPU is the weighted sum of SM_Eff_i across all kernels / ProfileStep time<br>'\
  '<b class="bold">Est. Achieved Occupancy:</b><br>'\
  'The SM occupancy for one kernel can be denoted as Occu_i = active warps on an SM / maximum number \
    of active warps supported by the SM. \
  Est. SM occupancy of GPU is the weighted average of Occu_i across all kernels<br>'\
  '<b class="bold">Tensor cores ratio:</b><br>'\
  'Sum of kernel time using Tensor Cores / Sum of total kernel time<br>'

TOOLTIP_MODEL_PERSPECTIVE_EN = \
  'Present CPU and GPU time for each stage of a model, i.e. DataLoader, Forward, Backward, Optimization and Other.<br>'\
  'CPU time is the execution time for code，GPU time is the calculation time of kernels launched in the stage.<br>'\
  '<b class="bold">DataLoader:</b> denote data fetching using paddle.io.DataLoader<br>'\
  '<b class="bold">Forward:</b> denote model forward<br>'\
  '<b class="bold">Backward:</b> denote gradient back-propagate<br>'\
  '<b class="bold">Optimization:</b> denote parameters update<br>'\
  '<b class="bold">Other:</b> other time out of above range'

TOOLTIP_MODEL_PERSPECTIVE_PERSTEP_EN = \
  'Present CPU and GPU time in each ProfileStep for each stage of a model, \
  i.e. DataLoader, Forward, Backward, Optimization and Other.<br>'\
  'CPU time is the execution time for code，GPU time is the calculation time of kernels launched in the stage.<br>'\
  '<b class="bold">DataLoader:</b> denote data fetching using paddle.io.DataLoader<br>'\
  '<b class="bold">Forward:</b> denote model forward<br>'\
  '<b class="bold">Backward:</b> denote gradient back-propagate<br>'\
  '<b class="bold">Optimization:</b> denote parameters update<br>'\
  '<b class="bold">Other:</b> other time out of above range'

TOOLTIP_EVENT_TYPE_PERSPECTIVE_EN = \
  'Present the distribution of each kind of events across DataLoader,\
  Forward, Backward, Optimization and Other stage.<br>'\
  '<b class="bold">Operator:</b> denote operator execution<br>'\
  '<b class="bold">CudaRuntime:</b> denote cuda runtime function execution<br>'\
  '<b class="bold">Kernel:</b> denote kernel execution on GPU<br>'\
  '<b class="bold">Memcpy:</b> denote data transfer between CPU and GPU<br>'\
  '<b class="bold">Memset:</b> denote memory data set on GPU<br>'\
  '<b class="bold">UserDefined:</b> denote events defined by users in python script<br>'\
  '<b class="bold">OperatorInner:</b> denote operator\'s subprocess execution<br>'\
  '<b class="bold">Communication:</b> denote events associated with distributed data transfer and computation.<br>'

TOOLTIP_EVENT_TYPE_MODEL_PERSPECTIVE_EN = \
  'Present the time of each kind of events included in DataLoader, Forward, Backward, Optimization \
    and Other stage.<br>'\
  '<b class="bold">Operator:</b> denote operator execution<br>'\
  '<b class="bold">CudaRuntime:</b> denote cuda runtime function execution<br>'\
  '<b class="bold">Kernel:</b> denote kernel execution on GPU<br>'\
  '<b class="bold">Memcpy:</b> denote data transfer between CPU and GPU<br>'\
  '<b class="bold">Memset:</b> denote memory data set on GPU<br>'\
  '<b class="bold">UserDefined:</b> denote events defined by users in python script<br>'\
  '<b class="bold">OperatorInner:</b> denote operator\'s subprocess execution<br>'\
  '<b class="bold">Communication:</b> denote events associated with distributed data transfer and computation.<br>'

TOOLTIP_EVENT_DISTRIBUTED_HISTOGRAM_EN = \
  'Present the time of communication, computation and their overlap in program.<br>'\
  '<b class="bold">ProfileStep:</b> denote an iteration step of training process<br>'\
  '<b class="bold">Communication:</b> denote the time related to communication, including events of communication type\
     in paddle framework、communication-related operators and GPU Kernels(nccl)<br>'\
  '<b class="bold">Computation:</b> denote the computation \
    time of GPU Kernels，except communication-related Kernels(nccl)<br>'\
  '<b class="bold">Overlap:</b> denote the overlap time between Communication and \
    Computation when they are executed parallelly.<br>'\
  '<b class="bold">Others:</b> denote the time out of Communication and Computation<br>'
