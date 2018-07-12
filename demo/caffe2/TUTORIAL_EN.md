# How to use VisualDL in Caffe2

Here we will show you how to use VisualDL with Caffe2 so that you can visualize the training process by using Caffe2.
We will use the Caffe2 Convolution Neural Network to train the handwritten digit [MNIST](http://yann.lecun.com/exdb/mnist/) dataset as an example.

This example is the simplification from Caffe2 MNIST tutorial
[Example](https://github.com/caffe2/tutorials/blob/master/MNIST.ipynb)in addition with VisualDL log writer.

The full demonstration code can be downloaded in [here](https://github.com/PaddlePaddle/VisualDL/blob/develop/demo/caffe2/caffe2_mnist_demo.py).

Make sure you have a working caffe2 environment before trying following code. Notice VisualDL requires protobuf 3.5+ in order to run.

First we initialize Loggers for different types of record as follows:

```python
from visualdl import LogWriter

# create VisualDL logger and directory
logdir = "/workspace"
logger = LogWriter(logdir, sync_cycle=100)

# create 'train' run
with logger.mode("train"):
    # create a scalar component called 'scalars/'
    scalar_caffe2_mnist_train_loss = logger.scalar("scalars/scalar_caffe2_mnist_train_loss")
    scalar_caffe2_mnist_train_accuracy = logger.scalar("scalars/scalar_caffe2_mnist_train_accuracy")
    histogram0 = logger.histogram("histogram/histogram0", num_buckets=50)
    histogram1 = logger.histogram("histogram/histogram1", num_buckets=50)

```

For our model, we will be constructing the LeNet model with the sigmoid activations replaced with ReLUs.
Following is how Caffe2 define input, operators and model definition.

```python
def AddInput(model, batch_size, db, db_type):
    data_uint8, label = model.TensorProtosDBInput(
        [], ["data_uint8", "label"], batch_size=batch_size,
        db=db, db_type=db_type)
    # cast the data to float
    data = model.Cast(data_uint8, "data", to=core.DataType.FLOAT)
    # scale data from [0,255] down to [0,1]
    data = model.Scale(data, data, scale=float(1. / 256))
    # don't need the gradient for the backward pass
    data = model.StopGradient(data, data)
    return data, label


def AddLeNetModel(model, data):
    # Image size: 28 x 28 -> 24 x 24
    conv1 = brew.conv(model, data, 'conv1', dim_in=1, dim_out=20, kernel=5)
    # Image size: 24 x 24 -> 12 x 12
    pool1 = brew.max_pool(model, conv1, 'pool1', kernel=2, stride=2)
    # Image size: 12 x 12 -> 8 x 8
    conv2 = brew.conv(model, pool1, 'conv2', dim_in=20, dim_out=50, kernel=5)
    # Image size: 8 x 8 -> 4 x 4
    pool2 = brew.max_pool(model, conv2, 'pool2', kernel=2, stride=2)
    # 50 * 4 * 4 stands for dim_out from previous layer multiplied by the image size
    # Here, the data is flattened from a tensor of dimension 50x4x4 to a vector of length 50*4*4
    fc3 = brew.fc(model, pool2, 'fc3', dim_in=50 * 4 * 4, dim_out=500)
    relu3 = brew.relu(model, fc3, 'relu3')
    # Last FC Layer
    pred = brew.fc(model, relu3, 'pred', dim_in=500, dim_out=10)
    # Softmax Layer
    softmax = brew.softmax(model, pred, 'softmax')

    return softmax


def AddAccuracy(model, softmax, label):
    """Adds an accuracy op to the model"""
    accuracy = brew.accuracy(model, [softmax, label], "accuracy")
    return accuracy


def AddTrainingOperators(model, softmax, label):
    """Adds training operators to the model."""
    # Compute cross entropy between softmax scores and labels
    xent = model.LabelCrossEntropy([softmax, label], 'xent')
    # Compute the expected loss
    loss = model.AveragedLoss(xent, "loss")
    # Track the accuracy of the model
    AddAccuracy(model, softmax, label)
    # Use the average loss we just computed to add gradient operators to the model
    model.AddGradientOperators([loss])
    # Specify the optimization algorithm
    optimizer.build_sgd(
        model,
        base_learning_rate=0.1,
        policy="step",
        stepsize=1,
        gamma=0.999,
    )
```

Use caffe2 model helper to construct model with definitions above. Prepare for training.

```python
arg_scope = {"order": "NCHW"}
# Create the model helper for the train model
train_model = model_helper.ModelHelper(name="mnist_train", arg_scope=arg_scope)
# Specify the input is from the train lmdb
data, label = AddInput(
    train_model, batch_size=64,
    db=os.path.join(data_folder, 'mnist-train-nchw-lmdb'),
    db_type='lmdb')
# Add the model definition (fc layers, conv layers, softmax, etc.)
softmax = AddLeNetModel(train_model, data)
# Add training operators, specify loss function and optimization algorithm
AddTrainingOperators(train_model, softmax, label)
```

Then we start training and use VisualDL to record data for scalar and histogram at the same time.
Here we record for accuracy, loss as scalars and weights as histogram.


```python
workspace.RunNetOnce(train_model.param_init_net)
workspace.CreateNet(train_model.net, overwrite=True)

total_iters = 200
accuracy = np.zeros(total_iters)
loss = np.zeros(total_iters)

# MAIN TRAINING LOOP!
# Now, we will manually run the network for 200 iterations.
for i in range(total_iters):
    workspace.RunNet(train_model.net)
    accuracy[i] = workspace.blobs['accuracy']
    loss[i] = workspace.blobs['loss']

    scalar_caffe2_mnist_train_loss.add_record(i, loss[i])
    scalar_caffe2_mnist_train_accuracy.add_record(i, accuracy[i])

    conv1_w = workspace.FetchBlob("conv1_w")
    conv2_w = workspace.FetchBlob("conv2_w")

    histogram0.add_record(i, conv1_w[0].flatten())
    histogram1.add_record(i, conv2_w[0].flatten())

    # Check the accuracy and loss every so often
    if i % 25 == 0:
        print("Iter: {}, Loss: {}, Accuracy: {}".format(i, loss[i], accuracy[i]))
```
