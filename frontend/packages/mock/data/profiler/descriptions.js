export default {
    overview_environment:
        '<b class="bold">CPU进程利用率：</b><br>进程所利用到的CPU的时间 / ProfileStep的时间(即性能分析的时间跨度）<br><b class="bold">CPU系统利用率</b><br>整个系统所有进程利用到的CPU时间 / CPU总时间（ProfileStep的时间*CPU核心数）<br><b class="bold">GPU利用率：</b><br>进程利用GPU计算的时间 / ProfileStep的时间，进程利用GPU计算的时间即是GPU Kernel计算的时间，越高越好<br><b class="bold">流处理器效率：</b><br>对于流处理器处理某个GPU Kernel, 其效率为SM_Eff_i = min(Kernel所用的Blocks数量 / GPU的流处理器数量, 100%)。流处理器效率为SM_Eff_i关于每个Kernel的执行时间加权和 / ProfileStep的时间<br><b class="bold">流处理器占用率：</b><br>对于流处理器处理某个GPU Kernel, 其占用率Occu_i = 为活跃的warp数 / 能支持的最大warp数。流处理器占用率为Occu_i关于每个Kernel执行时间的加权平均<br><b class="bold">Tensor cores使用时间占比：</b><br>使用Tensor Cores的GPU Kernel的计算时间 / 所有Kernel的计算时间<br>',
    overview_event_type_model_perspective:
        '展示在模型各阶段DataLoader, Forward, Backward, Optimization以及Other所包含的各种事件的时间。',
    overview_event_type_perspective:
        '展示不同类型的事件在模型各阶段DataLoader, Forward, Backward, Optimization以及Other的分布。',
    overview_model_perspective:
        '展示模型各阶段DataLoader, Forward, Backward, Optimization以及Other的总CPU和GPU时间。<br>CPU时间即是各阶段代码执行的时间，GPU时间是各阶段所调用的GPU Kernel在GPU上的计算时间。<br><b class="bold">DataLoader:</b> 表示使用paddle.io.DataLoader从数据集中取数据的阶段<br><b class="bold">Forward:</b> 表示模型前向计算的阶段<br><b class="bold">Backward:</b> 表示模型反向梯度计算的阶段<br><b class="bold">Optimization:</b> 表示模型优化更新参数的阶段<br><b class="bold">Other:</b> 其它时间<br>',
    overview_model_perspective_perstep:
        '展示每一个ProfileStep内模型各阶段DataLoader, Forward, Backward, Optimization以及Other的CPU和GPU时间。<br>CPU时间即是各阶段代码执行的时间，GPU时间是各阶段所调用的GPU Kernel在GPU上的计算时间。<br><b class="bold">DataLoader:</b> 表示使用paddle.io.DataLoader从数据集中取数据的阶段<br><b class="bold">Forward:</b> 表示模型前向计算的阶段<br><b class="bold">Backward:</b> 表示模型反向梯度计算的阶段<br><b class="bold">Optimization:</b> 表示模型优化更新参数的阶段<br><b class="bold">Other:</b> 其它时间<br>'
};
