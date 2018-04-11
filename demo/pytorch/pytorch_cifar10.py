# Copyright (c) 2017 VisualDL Authors. All Rights Reserve.
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

import torch
import torchvision
import torchvision.transforms as transforms
from torch.autograd import Variable
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
import torch.onnx
import matplotlib
from visualdl import LogWriter
import matplotlib.pyplot as plt
import numpy as np

matplotlib.use('Agg')

transform = transforms.Compose([
    transforms.ToTensor(), transforms.Normalize((0.5, 0.5, 0.5),
                                                (0.5, 0.5, 0.5))
])

trainset = torchvision.datasets.CIFAR10(
    root='./data', train=True, download=True, transform=transform)
trainloader = torch.utils.data.DataLoader(
    trainset, batch_size=500, shuffle=True, num_workers=2)

testset = torchvision.datasets.CIFAR10(
    root='./data', train=False, download=True, transform=transform)
testloader = torch.utils.data.DataLoader(
    testset, batch_size=500, shuffle=False, num_workers=2)

classes = ('plane', 'car', 'bird', 'cat', 'deer', 'dog', 'frog', 'horse',
           'ship', 'truck')


# functions to show an image
def imshow(img):
    img = img / 2 + 0.5  # unnormalize
    npimg = img.numpy()
    fig, ax = plt.subplots()
    plt.imshow(np.transpose(npimg, (1, 2, 0)))
    # we can either show the image or save it locally
    # plt.show()
    fig.savefig('out' + str(np.random.randint(0, 10000)) + '.pdf')


logdir = "./workspace"
logger = LogWriter(logdir, sync_cycle=100)

# mark the components with 'train' label.
with logger.mode("train"):
    # create a scalar component called 'scalars/'
    scalar_pytorch_train_loss = logger.scalar(
        "scalars/scalar_pytorch_train_loss")
    image1 = logger.image("images/image1", 1)
    image2 = logger.image("images/image2", 1)
    histogram0 = logger.histogram("histogram/histogram0", num_buckets=100)

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

# Define a Loss function and optimizer
criterion = nn.CrossEntropyLoss()
optimizer = optim.SGD(net.parameters(), lr=0.01, momentum=0.9)

train_step = 0

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
        weight_list = net.conv1.weight.view(6 * 3 * 5 * 5, -1)
        histogram0.add_record(train_step, weight_list)

        # image
        image1.start_sampling()
        image1.add_sample([96, 25], net.conv2.weight.view(16 * 6 * 5 * 5, -1))
        image1.finish_sampling()

        image2.start_sampling()
        image2.add_sample([18, 25], net.conv1.weight.view(6 * 3 * 5 * 5, -1))
        image2.finish_sampling()

        train_step += 1

        # print statistics
        running_loss += loss.data[0]
        if i % 2000 == 1999:  # print every 2000 mini-batches
            print('[%d, %5d] loss: %.3f' %
                  (epoch + 1, i + 1, running_loss / 2000))
            running_loss = 0.0

print('Finished Training')

dummy_input = Variable(torch.randn(4, 3, 32, 32))
torch.onnx.export(net, dummy_input, "pytorch_cifar10.onnx")

print('Done')
