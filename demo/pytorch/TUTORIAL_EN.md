# How to use VisualDL in PyTorch

Here we will show you how to use VisualDL in PyTorch so that you can visualize the training process of PyTorch.
We will use the PyTorch Convolution Neural Network to train the [Cifar10](https://www.cs.toronto.edu/~kriz/cifar.html) dataset as an example.

The training program comes from the [PyTorch Tutorial](http://pytorch.org/tutorials/beginner/blitz/cifar10_tutorial.html).

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

We can preview the Cifar10 picture set to be analyzed:

<p align=center>
<img width="70%" src="https://github.com/daming-lu/large_files/blob/master/pytorch_demo_figs/pytorch_cifar10_show_image.png?raw=true" />
</p>

We just need to create the VisualDL data collection loggers in the code

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

There are 50000 training images and 10000 test images in Cifar10. We set the training set size to 500,
and picture sampling rate to 500. The training set (batch) dimension is:
500 x 3 x 32 x 32

Then we start to build the CNN model

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

Then we start to train and use VisualDL to collect data at the same time

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

PyTorch support ONNX standard and it can export its model into ONNX.
PyTorch runs a single round of inference to trace the graph. We use a dummy input to run the model to produce the ONNX model

```python
import torch.onnx
dummy_input = Variable(torch.randn(4, 3, 32, 32))
torch.onnx.export(net, dummy_input, "pytorch_cifar10.onnx")

print('Done')
```

After the training, the visual results of each component are as follows:

The scalar diagram of the error is as follows:

<p align=center>
<img width="70%" src="https://github.com/daming-lu/large_files/blob/master/pytorch_demo_figs/sc_scalar.png?raw=true" />
</p>

The picture of the first, second layer convolution weight after the training are as follows:

<p align=center>
<img width="70%" src="https://github.com/daming-lu/large_files/blob/master/pytorch_demo_figs/sc_image.png?raw=true" />
</p>


The histograms of the training parameters is as follows:

<p align=center>
<img width="70%" src="https://github.com/daming-lu/large_files/blob/master/pytorch_demo_figs/sc_hist.png?raw=true" />
</p>


The model graph is as follows:

<p align=center>
<img width="70%" src="https://github.com/daming-lu/large_files/blob/master/pytorch_demo_figs/sc_graph.png?raw=true" />
</p>


You can download the full size image [here](https://github.com/daming-lu/large_files/blob/master/pytorch_demo_figs/graph.png?Raw=true).
