# 使用VisualDL做性能分析

### 概述

飞桨从2.3.0版本开始加入了性能分析工具，可以采集并导出主机侧（CPU)和设备侧（GPU、MLU)的性能数据。VisualDL支持对导出的性能数据进行可视化，以便辅助您分析性能瓶颈并寻求优化方案来获得性能的提升。关于如何使用飞桨进行性能分析可以参考[文档](https://www.paddlepaddle.org.cn/documentation/docs/zh/develop/guides/performance_improving/profiling_model.html)。

### 使用方式

1. 收集并导出性能数据。
示例代码:
```python
import paddle
import paddle.profiler as profiler
import paddle.nn.functional as F
from paddle.vision.transforms import ToTensor
import numpy as np

transform = ToTensor()
cifar10_train = paddle.vision.datasets.Cifar10(mode='train',
                                               transform=transform)
cifar10_test = paddle.vision.datasets.Cifar10(mode='test',
                                              transform=transform)
class MyNet(paddle.nn.Layer):
    def __init__(self, num_classes=1):
        super(MyNet, self).__init__()

        self.conv1 = paddle.nn.Conv2D(in_channels=3, out_channels=32, kernel_size=(3, 3))
        self.pool1 = paddle.nn.MaxPool2D(kernel_size=2, stride=2)

        self.conv2 = paddle.nn.Conv2D(in_channels=32, out_channels=64, kernel_size=(3,3))
        self.pool2 = paddle.nn.MaxPool2D(kernel_size=2, stride=2)

        self.conv3 = paddle.nn.Conv2D(in_channels=64, out_channels=64, kernel_size=(3,3))

        self.flatten = paddle.nn.Flatten()

        self.linear1 = paddle.nn.Linear(in_features=1024, out_features=64)
        self.linear2 = paddle.nn.Linear(in_features=64, out_features=num_classes)

    def forward(self, x):
        x = self.conv1(x)
        x = F.relu(x)
        x = self.pool1(x)

        x = self.conv2(x)
        x = F.relu(x)
        x = self.pool2(x)

        x = self.conv3(x)
        x = F.relu(x)

        x = self.flatten(x)
        x = self.linear1(x)
        x = F.relu(x)
        x = self.linear2(x)
        return x

epoch_num = 10
batch_size = 32
learning_rate = 0.001
val_acc_history = []
val_loss_history = []

def train(model):
    print('start training ... ')
    # turn into training mode
    model.train()

    opt = paddle.optimizer.Adam(learning_rate=learning_rate,
                                parameters=model.parameters())

    train_loader = paddle.io.DataLoader(cifar10_train,
                                        shuffle=True,
                                        batch_size=batch_size,
                                        num_workers=1)

    valid_loader = paddle.io.DataLoader(cifar10_test, batch_size=batch_size)

    # 创建性能分析器相关的代码
    def my_on_trace_ready(prof): # 定义回调函数，性能分析器结束采集数据时会被调用
      callback = profiler.export_chrome_tracing('./profiler_demo') # 创建导出性能数据到 profiler_demo 文件夹的回调函数
      callback(prof)  # 执行该导出函数
      prof.summary(sorted_by=profiler.SortedKeys.GPUTotal) # 打印表单，按 GPUTotal 排序表单项

    p = profiler.Profiler(scheduler = [3,14], on_trace_ready=my_on_trace_ready, timer_only=False) # 初始化 Profiler 对象

    p.start() # 性能分析器进入第 0 个 step

    for epoch in range(epoch_num):
        for batch_id, data in enumerate(train_loader()):
            x_data = data[0]
            y_data = paddle.to_tensor(data[1])
            y_data = paddle.unsqueeze(y_data, 1)

            logits = model(x_data)
            loss = F.cross_entropy(logits, y_data)

            if batch_id % 1000 == 0:
                print("epoch: {}, batch_id: {}, loss is: {}".format(epoch, batch_id, loss.numpy()))
            loss.backward()
            opt.step()
            opt.clear_grad()

            p.step() # 指示性能分析器进入下一个 step
            if batch_id == 19:
              p.stop() # 关闭性能分析器
              exit() # 做性能分析时，可以将程序提前退出

        # evaluate model after one epoch
        model.eval()
        accuracies = []
        losses = []
        for batch_id, data in enumerate(valid_loader()):
            x_data = data[0]
            y_data = paddle.to_tensor(data[1])
            y_data = paddle.unsqueeze(y_data, 1)

            logits = model(x_data)
            loss = F.cross_entropy(logits, y_data)
            acc = paddle.metric.accuracy(logits, y_data)
            accuracies.append(acc.numpy())
            losses.append(loss.numpy())

        avg_acc, avg_loss = np.mean(accuracies), np.mean(losses)
        print("[validation] accuracy/loss: {}/{}".format(avg_acc, avg_loss))
        val_acc_history.append(avg_acc)
        val_loss_history.append(avg_loss)
        model.train()

model = MyNet(num_classes=10)
train(model)
```
上述代码使用paddle.profiler接口收集了step区间[3, 14) 的性能数据，并把数据导出在profiler_demo文件夹中，您可以在目录中看到.json格式的文件。

2. 开启VisualDL进行可视化

运行上述程序后，在命令行执行

```shell
visualdl --logdir ./profiler_demo --port 8080
```

接着在浏览器打开`http://127.0.0.1:8080`，即可查看性能分析界面。
<p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/185844003-b869570d-82a8-4d0c-8751-c1b57c8788bb.png" width="100%"/>
</p>

当前一共提供了Overview、Operator、GPU Kernel、Distributed、Trace、Memory共六个视图的分析。

### Overview
Overview视图展示了模型性能的总览情况，包含了 配置详情、设备详情、运行耗时、训练步数耗时、
性能消耗、模型各阶段消耗分布、自定义事件耗时 共七个板块的图表。
<p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/185893177-a049c8d5-2310-4138-8dd5-844cf198e425.gif" width="100%"/>
</p>
- 配置详情：展示当前数据流（run) 里包含的进程数目，以及所用到的设备类型。
- 设备详情：展示所用到的设备的详情信息，包括利用率、占用率等指标。
- 运行耗时：展示模型在DataLoader, Forward, Backward, Optimization以及Other这几个阶段的总CPU和GPU时间。
- 训练步数耗时：展示每一个ProfileStep内模型在DataLoader, Forward, Backward, Optimization以及Other这几个阶段的CPU和GPU时间。
- 性能消耗：展示不同类型的事件在模型DataLoader, Forward, Backward, Optimization以及Other这几个阶段的分布。
- 模型各阶段消耗分布：展示在模型各阶段DataLoader, Forward, Backward, Optimization以及Other所包含的各种事件的时间。
- 自定义事件耗时： 展示用户在python脚本中自定义记录的事件的CPU和GPU时间。

### Operator
Operator视图展示框架内算子的执行情况。
<p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/185893218-bff646f1-3d9f-448b-99c8-39f2309db65d.gif" width="100%"/>
</p>

### GPU Kernel
GPU Kernel视图展示算子在设备上的计算Kernel的执行情况。
<p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/185893227-64837816-e6a5-41ad-b8f4-d1dfef3fd40b.gif" width="100%"/>
</p>
### Distributed
Distributed视图展示分布式训练中通信 (Communication)、计算 (Computation) 以及这两者 Overlap 的时间。
<p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/185893682-e9330b99-e344-423a-8935-dc050a4cab45.gif" width="100%"/>
</p>
### Trace
Trace视图展示记录的所有性能数据的时间线timeline。
<p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/185893687-1788586e-4371-4136-baf7-f3edcbc19003.gif" width="100%"/>
</p>
### Memory
Memory视图展示所有记录的存储分配以及释放的事件。
<p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/185893743-43643f2d-0c5a-46ad-8ad8-b04ae48ecc97.gif" width="100%"/>
</p>