# 如何在PyTorch中使用VisualDL

下面我们演示一下如何在PyTorch中使用VisualDL，从而可以把PyTorch的训练过程以及最后的模型可视化出来。我们将以PyTorch用卷积神经网络(CNN, Convolutional Neural Network)来训练
[Cifar10](https://www.cs.toronto.edu/~kriz/cifar.html) 数据集作为例子。


程序的主体来自PyTorch的 [Tutorial](http://pytorch.org/tutorials/beginner/blitz/cifar10_tutorial.html)
我们同时提供了 Jupyter Notebook 的可交互版本。请参见本文件夹里面的 pytorch_cifar10.ipynb

```python
import torch
import torchvision
import torchvision.transforms as transforms
from torch.autograd import Variable
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim

import matplotlib
matplotlib.use('Agg')

from visualdl import LogWriter


transform = transforms.Compose(
    [transforms.ToTensor(),
     transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))])

trainset = torchvision.datasets.CIFAR10(root='./data', train=True,
                                        download=True, transform=transform)
trainloader = torch.utils.data.DataLoader(trainset, batch_size=500,
                                          shuffle=True, num_workers=2)

testset = torchvision.datasets.CIFAR10(root='./data', train=False,
                                       download=True, transform=transform)
testloader = torch.utils.data.DataLoader(testset, batch_size=500,
                                         shuffle=False, num_workers=2)

classes = ('plane', 'car', 'bird', 'cat',
           'deer', 'dog', 'frog', 'horse', 'ship', 'truck')


import matplotlib.pyplot as plt
import numpy as np


# functions to show an image
def imshow(img):
    img = img / 2 + 0.5     # unnormalize
    npimg = img.numpy()
    fig, ax = plt.subplots()
    plt.imshow(np.transpose(npimg, (1, 2, 0)))
    # we can either show the image or save it locally
    # plt.show()
    fig.savefig('out' + str(np.random.randint(0, 10000)) + '.pdf')
```

我们可以预览一下将要分析的 Cifar10 图片集：
<p align=center>
<img width="70%" src="https://github.com/daming-lu/large_files/blob/master/pytorch_demo_figs/pytorch_cifar10_show_image.png?raw=true" />
</p>


然后我们开始创建 VisualDL 的数据采集 loggers

```python
logdir = "/workspace"
logger = LogWriter(logdir, sync_cycle=100)

# mark the components with 'train' label.
with logger.mode("train"):
    # create a scalar component called 'scalars/'
    scalar_pytorch_train_loss = logger.scalar("scalars/scalar_pytorch_train_loss")
    image1 = logger.image("images/image1", 1)
    image2 = logger.image("images/image2", 1)
    histogram0 = logger.histogram("histogram/histogram0", num_buckets=100)
```

Cifar10 中有 50000 个训练图像和 10000 个测试图像。我们每 500 个作为一个训练集，图片采样也选 500 。 每个训练集 (batch) 是如下的维度：

500 x 3 x 32 x 32

接下来我们开始创建 CNN 模型

```python
# get some random training images
dataiter = iter(trainloader)
images, labels = dataiter.next()

# show images
imshow(torchvision.utils.make_grid(images))
# print labels
print(' '.join('%5s' % classes[labels[j]] for j in range(4)))

# Define a Convolution Neural Network
class Net(nn.Module):
    def __init__(self):
        super(Net, self).__init__()
        self.conv1 = nn.Conv2d(3, 6, 5)
        self.pool = nn.MaxPool2d(2, 2)
        self.conv2 = nn.Conv2d(6, 16, 5)
        self.fc1 = nn.Linear(16 * 5 * 5, 120)
        self.fc2 = nn.Linear(120, 84)
        self.fc3 = nn.Linear(84, 10)

    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = x.view(-1, 16 * 5 * 5)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        x = self.fc3(x)
        return x


net = Net()
```

接下来我们开始训练并且同时用 VisualDL 来采集相关数据

```python
# Train the network
for epoch in range(5):  # loop over the dataset multiple times
    running_loss = 0.0
    for i, data in enumerate(trainloader, 0):
        # get the inputs
        inputs, labels = data

        # wrap them in Variable
        inputs, labels = Variable(inputs), Variable(labels)

        # zero the parameter gradients
        optimizer.zero_grad()

        # forward + backward + optimize
        outputs = net(inputs)
        loss = criterion(outputs, labels)

        loss.backward()
        optimizer.step()

        # use VisualDL to retrieve metrics
        # scalar
        scalar_pytorch_train_loss.add_record(train_step, float(loss))

        # histogram
        weight_list = net.conv1.weight.view(6*3*5*5, -1)
        histogram0.add_record(train_step, weight_list)

        # image
        image1.start_sampling()
        image1.add_sample([96, 25], net.conv2.weight.view(16*6*5*5, -1))
        image1.finish_sampling()

        image2.start_sampling()
        image2.add_sample([18, 25], net.conv1.weight.view(6*3*5*5, -1))
        image2.finish_sampling()


        train_step += 1

        # print statistics
        running_loss += loss.data[0]
        if i % 2000 == 1999:    # print every 2000 mini-batches
            print('[%d, %5d] loss: %.3f' %
                  (epoch + 1, i + 1, running_loss / 2000))
            running_loss = 0.0

print('Finished Training')
```

最后，因为 PyTorch 采用 Dynamic Computation Graphs，我们用一个 dummy 输入来空跑一下模型，以便产生图

```python
import torch.onnx
dummy_input = Variable(torch.randn(4, 3, 32, 32))
torch.onnx.export(net, dummy_input, "pytorch_cifar10.onnx")

print('Done')
```

训练结束后，各个组件的可视化结果如下：

关于误差的数值图的如下：

<p align=center>
<img width="70%" src="https://github.com/daming-lu/large_files/blob/master/pytorch_demo_figs/sc_scalar.png?raw=true" />
</p>

训练过后的第一，第二层卷积权重图的如下：

<p align=center>
<img width="70%" src="https://github.com/daming-lu/large_files/blob/master/pytorch_demo_figs/sc_image.png?raw=true" />
</p>


训练参数的柱状图的如下：

<p align=center>
<img width="70%" src="https://github.com/daming-lu/large_files/blob/master/pytorch_demo_figs/sc_hist.png?raw=true" />
</p>


模型图的效果如下：

<p align=center>
<img width="70%" src="https://github.com/daming-lu/large_files/blob/master/pytorch_demo_figs/sc_graph.png?raw=true" />
</p>


生成的完整效果图可以在[这里](https://github.com/daming-lu/large_files/blob/master/pytorch_demo_figs/graph.png?raw=true)下载。
