import numpy as np
import paddle
import paddle.nn.functional as F
import paddle.profiler as profiler
from paddle.vision.transforms import ToTensor

transform = ToTensor()
cifar10_train = paddle.vision.datasets.Cifar10(
    mode='train', transform=transform)
cifar10_test = paddle.vision.datasets.Cifar10(mode='test', transform=transform)


class MyNet(paddle.nn.Layer):
    def __init__(self, num_classes=1):
        super(MyNet, self).__init__()

        self.conv1 = paddle.nn.Conv2D(
            in_channels=3, out_channels=32, kernel_size=(3, 3))
        self.pool1 = paddle.nn.MaxPool2D(kernel_size=2, stride=2)

        self.conv2 = paddle.nn.Conv2D(
            in_channels=32, out_channels=64, kernel_size=(3, 3))
        self.pool2 = paddle.nn.MaxPool2D(kernel_size=2, stride=2)

        self.conv3 = paddle.nn.Conv2D(
            in_channels=64, out_channels=64, kernel_size=(3, 3))

        self.flatten = paddle.nn.Flatten()

        self.linear1 = paddle.nn.Linear(in_features=1024, out_features=64)
        self.linear2 = paddle.nn.Linear(
            in_features=64, out_features=num_classes)

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

    opt = paddle.optimizer.Adam(
        learning_rate=learning_rate, parameters=model.parameters())

    train_loader = paddle.io.DataLoader(
        cifar10_train, shuffle=True, batch_size=batch_size, num_workers=1)

    valid_loader = paddle.io.DataLoader(cifar10_test, batch_size=batch_size)

    # 创建性能分析器相关的代码
    def my_on_trace_ready(prof):  # 定义回调函数，性能分析器结束采集数据时会被调用
        callback = profiler.export_chrome_tracing(
            './profiler_demo')  # 创建导出性能数据到 profiler_demo 文件夹的回调函数
        callback(prof)  # 执行该导出函数
        prof.summary(
            sorted_by=profiler.SortedKeys.GPUTotal)  # 打印表单，按 GPUTotal 排序表单项

    p = profiler.Profiler(
        scheduler=[3, 14], on_trace_ready=my_on_trace_ready,
        timer_only=False)  # 初始化 Profiler 对象

    p.start()  # 性能分析器进入第 0 个 step

    for epoch in range(epoch_num):
        for batch_id, data in enumerate(train_loader()):
            x_data = data[0]
            y_data = paddle.to_tensor(data[1])
            y_data = paddle.unsqueeze(y_data, 1)

            logits = model(x_data)
            loss = F.cross_entropy(logits, y_data)

            if batch_id % 1000 == 0:
                print("epoch: {}, batch_id: {}, loss is: {}".format(
                    epoch, batch_id, loss.numpy()))
            loss.backward()
            opt.step()
            opt.clear_grad()

            p.step()  # 指示性能分析器进入下一个 step
            if batch_id == 19:
                p.stop()  # 关闭性能分析器
                exit()  # 做性能分析时，可以将程序提前退出

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
