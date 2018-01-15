import logging

import mxnet as mx
# Here we import LogWriter so that we can write log data while MXNet is training
from visualdl import LogWriter

# Download MNIST data
mnist = mx.test_utils.get_mnist()
batch_size = 100


# Provide a folder to store data for log, model, image, etc. VisualDL's visualization will be
# based on this folder.
logdir = "./tmp"

# Initialize a logger instance. Parameter 'sync_cycle' means write a log every 10 operations on
# memory.
logger = LogWriter(logdir, sync_cycle=10)

# mark the components with 'train' label.
with logger.mode("train"):
    # scalar0 is used to record scalar metrics while MXNet is training. We will record accuracy.
    # In the visualization, we can see the accuracy is increasing as more training steps happen.
    scalar0 = logger.scalar("scalars/scalar0")

# Record training steps
cnt_step = 0


# MXNet provides many callback interface. Here we define our own callback method and it is called
# after every batch.
# https://mxnet.incubator.apache.org/api/python/callback/callback.html
def add_scalar():
    def _callback(param):
        with logger.mode("train"):
            global cnt_step
            # Here the value is the accuracy we want to record
            # https://mxnet.incubator.apache.org/_modules/mxnet/callback.html
            name_value = param.eval_metric.get_name_value()
            for name, value in name_value:
                scalar0.add_record(cnt_step, value)
                cnt_step += 1
    return _callback


# Start to build CNN in MXNet, train MNIST dataset. For more info, check MXNet's official website:
# https://mxnet.incubator.apache.org/tutorials/python/mnist.html

logging.getLogger().setLevel(logging.DEBUG)  # logging to stdout

train_iter = mx.io.NDArrayIter(mnist['train_data'], mnist['train_label'], batch_size, shuffle=True)
val_iter = mx.io.NDArrayIter(mnist['test_data'], mnist['test_label'], batch_size)

data = mx.sym.var('data')
# first conv layer
conv1 = mx.sym.Convolution(data=data, kernel=(5, 5), num_filter=20)
tanh1 = mx.sym.Activation(data=conv1, act_type="tanh")
pool1 = mx.sym.Pooling(data=tanh1, pool_type="max", kernel=(2, 2), stride=(2, 2))
# second conv layer
conv2 = mx.sym.Convolution(data=pool1, kernel=(5, 5), num_filter=50)
tanh2 = mx.sym.Activation(data=conv2, act_type="tanh")
pool2 = mx.sym.Pooling(data=tanh2, pool_type="max", kernel=(2, 2), stride=(2, 2))
# first fullc layer
flatten = mx.sym.flatten(data=pool2)
fc1 = mx.symbol.FullyConnected(data=flatten, num_hidden=500)
tanh3 = mx.sym.Activation(data=fc1, act_type="tanh")
# second fullc
fc2 = mx.sym.FullyConnected(data=tanh3, num_hidden=10)
# softmax loss
lenet = mx.sym.SoftmaxOutput(data=fc2, name='softmax')

# create a trainable module on CPU
lenet_model = mx.mod.Module(symbol=lenet, context=mx.cpu())


# train with the same
lenet_model.fit(train_iter,
                eval_data=val_iter,
                optimizer='sgd',
                optimizer_params={'learning_rate': 0.1},
                eval_metric='acc',
                # integrate our customized callback method
                batch_end_callback=[add_scalar()],
                num_epoch=2)

test_iter = mx.io.NDArrayIter(mnist['test_data'], None, batch_size)
prob = lenet_model.predict(test_iter)
test_iter = mx.io.NDArrayIter(mnist['test_data'], mnist['test_label'], batch_size)

# predict accuracy for lenet
acc = mx.metric.Accuracy()
lenet_model.score(test_iter, acc)
print(acc)
