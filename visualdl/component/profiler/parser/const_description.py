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
  '<div class="bold">CPU进程利用率：</div>'\
  '<div class="indent">进程所利用到的CPU的时间 / ProfileStep的时间(即性能分析的时间跨度）</div>'\
  '<div class="bold">CPU系统利用率</div>'\
  '<div class="indent">整个系统所有进程利用到的CPU时间 / CPU总时间（ProfileStep的时间*CPU核心数）</div>'\
  '<div class="bold">GPU利用率：</div>'\
  '<div class="indent">进程利用GPU计算的时间 / ProfileStep的时间，进程利用GPU计算的时间即是GPU Kernel计算的时间，越高越好</div>'\
  '<div class="bold">流处理器效率：</div>'\
  '<div class="indent">对于流处理器处理某个GPU Kernel, 其效率为SM_Eff_i = min(Kernel所用的Blocks数量 / GPU的流处理器数量, 100%)'\
  '流处理器效率为SM_Eff_i关于每个Kernel的执行时间加权和 / ProfileStep的时间</div>'\
  '<div class="bold">流处理器占用率：</div>'\
  '<div class="indent">对于流处理器处理某个GPU Kernel, 其占用率Occu_i = 为活跃的warp数 / 能支持的最大warp数。流处理器占用率为\
    Occu_i关于每个Kernel执行时间的加权平均</div>'\
  '<div class="bold">Tensor cores使用时间占比：</div>'\
  '<div class="indent">使用Tensor Cores的GPU Kernel的计算时间 / 所有Kernel的计算时间</div>'

TOOLTIP_MODEL_PERSPECTIVE_CN = \
  '<div>展示模型各阶段DataLoader, Forward, Backward, Optimization以及Other的总CPU和GPU时间。</div>'\
  '<div>CPU时间即是各阶段代码执行的时间，GPU时间是各阶段所调用的GPU Kernel在GPU上的计算时间。</div>'\
  '<div class="indent"><div class="bold">DataLoader:</div> 表示使用paddle.io.DataLoader从数据集中取数据的阶段</div>'\
  '<div class="indent"><div class="bold">Forward: </div> 表示模型前向计算的阶段</div>'\
  '<div class="indent"><div class="bold">Backward: </div> 表示模型反向梯度计算的阶段</div>'\
  '<div class="indent"><div class="bold">Optimization: </div> 表示模型优化更新参数的阶段</div>'\
  '<div class="indent"><div class="bold">Other: </div> 其它时间</div>'

TOOLTIP_MODEL_PERSPECTIVE_PERSTEP_CN = \
  '<div>展示每一个ProfileStep内模型各阶段DataLoader, Forward, Backward, Optimization以及Other的CPU和GPU时间。</div>'\
  '<div>CPU时间即是各阶段代码执行的时间，GPU时间是各阶段所调用的GPU Kernel在GPU上的计算时间。</div>'\
  '<div class="indent"><div class="bold">DataLoader:</div> 表示使用paddle.io.DataLoader从数据集中取数据的阶段</div>'\
  '<div class="indent"><div class="bold">Forward: </div> 表示模型前向计算的阶段</div>'\
  '<div class="indent"><div class="bold">Backward: </div> 表示模型反向梯度计算的阶段</div>'\
  '<div class="indent"><div class="bold">Optimization: </div> 表示模型优化更新参数的阶段</div>'\
  '<div class="indent"><div class="bold">Other: </div> 其它时间</div>'

TOOLTIP_EVENT_TYPE_PERSPECTIVE_CN = \
  '<div>展示不同类型的事件在模型各阶段DataLoader, Forward, Backward, Optimization以及Other的分布。</div>'

TOOLTIP_EVENT_TYPE_MODEL_PERSPECTIVE_CN = \
  '<div>展示在模型各阶段DataLoader, Forward, Backward, Optimization以及Other所包含的各种事件的时间。</div>'

TOOLTIP_DEVICE_INFO_EN = \
  '<div class="bold">CPU Process Utilization：</div>'\
  '<div class="indent">Process CPU time / ProfileStep time(total time of profiling）</div>'\
  '<div class="bold">CPU System Utilization：</div>'\
  '<div class="indent">Sum of system\'s all processes CPU time/ CPU total time（ProfileStep time* #CPU Core)</div>'\
  '<div class="bold">GPU Utilization</div>'\
  '<div class="indent">GPU busy time / ProfileStep time，GPU busy time is the time during in which at \
    least one GPU kernel is running on it.</div>'\
  '<div class="bold">Est. SM Efficiency</div>'\
  '<div class="indent">The SM efficiency for one kernel can be denoted as SM_Eff_i = \
    min(blocks of this kernel / SM number of this GPU, 100%).'\
  'Est. SM efficiency of GPU is the weighted sum of SM_Eff_i across all kernels / ProfileStep time</div>'\
  '<div class="bold">Est. Achieved Occupancy</div>'\
  '<div class="indent">The SM occupancy for one kernel can be denoted as Occu_i = active warps on an SM / maximum number \
    of active warps supported by the SM. \
  Est. SM occupancy of GPU is the weighted average of Occu_i across all kernels</div>'\
  '<div class="bold">Tensor cores ratio</div>'\
  '<div class="indent">Sum of kernel time using Tensor Cores / Sum of total kernel time</div>'

TOOLTIP_MODEL_PERSPECTIVE_EN = \
  '<div>Present CPU and GPU time for each stage of a model, i.e. DataLoader, \
    Forward, Backward, Optimization and Other.</div>'\
  '<div>CPU time is the execution time for code，GPU time is the calculation time of \
    kernels launched in the stage.</div>'\
  '<div class="indent"> <div class="bold">DataLoader:</div>denote data fetching using paddle.io.DataLoader</div>'\
  '<div class="indent"> <div class="bold">Forward:</div>denote model forward</div>'\
  '<div class="indent"> <div class="bold">Backward:</div>denote gradient back-propagate</div>'\
  '<div class="indent"> <div class="bold">Optimization:</div>denote parameters update</div>'\
  '<div class="indent"> <div class="bold">Other:</div>other time out of above range'

TOOLTIP_MODEL_PERSPECTIVE_PERSTEP_EN = \
  '<div>Present CPU and GPU time in each ProfileStep for each stage of a model, \
  i.e. DataLoader, Forward, Backward, Optimization and Other.</div>'\
  '<div>CPU time is the execution time for code，GPU time is the calculation time of \
    kernels launched in the stage.</div>'\
  '<div class="indent"> <div class="bold">DataLoader:</div>denote data fetching using paddle.io.DataLoader</div>'\
  '<div class="indent"> <div class="bold">Forward:</div>denote model forward</div>'\
  '<div class="indent"> <div class="bold">Backward:</div>denote gradient back-propagate</div>'\
  '<div class="indent"> <div class="bold">Optimization:</div>denote parameters update</div>'\
  '<div class="indent"> <div class="bold">Other:</div>other time out of above range'

TOOLTIP_EVENT_TYPE_PERSPECTIVE_EN = \
  '<div>Present the distribution of each kind of \
    events across DataLoader, Forward, Backward, Optimization and Other stage.</div>'

TOOLTIP_EVENT_TYPE_MODEL_PERSPECTIVE_EN = \
  '<div>Present the time of each kind of events included in DataLoader, \
    Forward, Backward, Optimization and Other stage.</div>'
