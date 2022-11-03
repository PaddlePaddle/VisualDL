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
Operator视图展示框架内算子的执行情况。当算子详情表格选择按算子名称+输入形状排列时，会显示出算子的输入张量的shape。
<p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/185893218-bff646f1-3d9f-448b-99c8-39f2309db65d.gif" width="100%"/>
</p>


### GPU Kernel
GPU Kernel视图展示算子在设备上的计算Kernel的执行情况。当核详情表格选择按核名称+核属性分组时，将会显示对应算子、线程块等额外信息。
<p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/185893227-64837816-e6a5-41ad-b8f4-d1dfef3fd40b.gif" width="100%"/>
</p>

### Distributed
Distributed视图展示分布式训练中通信 (Communication)、计算 (Computation) 以及这两者 Overlap 的时间。
<p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/185893682-e9330b99-e344-423a-8935-dc050a4cab45.gif" width="100%"/>
</p>

- Communication：表示和通信相关的时间，包括框架内打的Communication事件、和通信有关的算子和Kernel（nccl)执行的时间。
- Computation：表示GPU Kernel计算的时间，但是去除了和通信有关的Kernel(nccl)。
- Overlap： 表示通信和计算过程并行执行时候时间相互重叠的部分。
- Others：表示通信和计算之外的时间。

### Trace
Trace视图展示记录的所有性能数据的时间线timeline。
<p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/185893687-1788586e-4371-4136-baf7-f3edcbc19003.gif" width="100%"/>
</p>

- 可以查看 CPU 和 GPU 在不同线程或 stream 下的事件发生的时间线。将同一线程下所记录的数据分为 Python 层和 C++ 层，以便根据需要进行折叠和展开。对于有名字的线程，标注线程名字。
- 所展示的事件名字上标注事件所持续的时间，点击具体的事件，可在下方的说明栏中看到更详细的事件信息。通过按键 `w`、`s` 可进行放大和缩小，通过`a`、`d`可进行左移和右移。
- 对于 GPU 上的事件，可以通过点击下方的`launch`链接查看所发起它的 CPU 上的事件。

### Memory
Memory视图展示所有记录的存储分配以及释放的事件。
<p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/185893743-43643f2d-0c5a-46ad-8ad8-b04ae48ecc97.gif" width="100%"/>
</p>
由于飞桨框架中的存储管理是先向操作系统或者设备申请一大块存储，申请下来的存储称之为预留（Reserved)存储。当需要创建张量分配内存时，再从预留存储中分配出去，预留存储由飞桨框架自己管理，分配给张量的存储才是真实的已分配（Allocated)存储。

- 显示存储曲线，可以看到不同设备上分配（Allocated）和预留（Reserved）两种存储随时间的变化曲线。
- 展示每个地址的存储所申请和释放的时间以及在哪个事件中发生的。
- 展示每个事件所发生的存储申请和释放的次数，以及在性能分析的周期内所净增加的存储量。
  