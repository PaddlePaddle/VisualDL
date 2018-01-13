import mxnet as mx
import numpy

# 引入VisualDL
from visualdl import LogWriter

# 下载MNIST数据集
mnist = mx.test_utils.get_mnist()
batch_size = 100


# 给VisualDL指定一个文件夹，用来存储日志，模型，图片等数据，供可视化使用
logdir = "./tmp"

# 创建一个logger实例，sync_cycle是读取内存的频率，意思是每十次内存操作，会读取一次数据
logger = LogWriter(logdir, sync_cycle=10)

# mark the components with 'train' label.
with logger.mode("train"):
    # 这里scalar0 用来记录MXNet训练过程中的数值信息。我们将记录随着训练的进行，我们的准确率会不断降低
    scalar0 = logger.scalar("scalars/scalar0")

# 记录训练步数
cnt_step = 0


# MXNet提供了许多回调函数的接口，这里我们定义我们自己的回调函数，在每个训练批次（batch）结束时调用
# https://mxnet.incubator.apache.org/api/python/callback/callback.html
def add_scalar():
    def _callback(param):
        with logger.mode("train"):
            global cnt_step
            # 这里的value是我们要记录的准确率accuracy
            # https://mxnet.incubator.apache.org/_modules/mxnet/callback.html
            name_value = param.eval_metric.get_name_value()
            for name, value in name_value:
                scalar0.add_record(cnt_step, value)
                cnt_step += 1
    return _callback


# 开始用MXNet建立CNN，训练MNIST数据集，详情请参见MXNet官方网站
# https://mxnet.incubator.apache.org/tutorials/python/mnist.html

import logging
logging.getLogger().setLevel(logging.DEBUG)  # logging to stdout

train_iter = mx.io.NDArrayIter(mnist['train_data'], mnist['train_label'], batch_size, shuffle=True)
val_iter = mx.io.NDArrayIter(mnist['test_data'], mnist['test_label'], batch_size)

data = mx.sym.var('data')
# first conv layer
conv1 = mx.sym.Convolution(data=data, kernel=(5,5), num_filter=20)
tanh1 = mx.sym.Activation(data=conv1, act_type="tanh")
pool1 = mx.sym.Pooling(data=tanh1, pool_type="max", kernel=(2,2), stride=(2,2))
# second conv layer
conv2 = mx.sym.Convolution(data=pool1, kernel=(5,5), num_filter=50)
tanh2 = mx.sym.Activation(data=conv2, act_type="tanh")
pool2 = mx.sym.Pooling(data=tanh2, pool_type="max", kernel=(2,2), stride=(2,2))
# first fullc layer
flatten = mx.sym.flatten(data=pool2)
fc1 = mx.symbol.FullyConnected(data=flatten, num_hidden=500)
tanh3 = mx.sym.Activation(data=fc1, act_type="tanh")
# second fullc
fc2 = mx.sym.FullyConnected(data=tanh3, num_hidden=10)
# softmax loss
lenet = mx.sym.SoftmaxOutput(data=fc2, name='softmax')

# create a trainable module on GPU 0
lenet_model = mx.mod.Module(symbol=lenet, context=mx.cpu())


# train with the same
lenet_model.fit(train_iter,
                eval_data=val_iter,
                optimizer='sgd',
                optimizer_params={'learning_rate':0.1},
                eval_metric='acc',
                # 在此嵌入我们自定义的回调函数
                batch_end_callback=[add_scalar()],
                num_epoch=2)

test_iter = mx.io.NDArrayIter(mnist['test_data'], None, batch_size)
prob = lenet_model.predict(test_iter)
test_iter = mx.io.NDArrayIter(mnist['test_data'], mnist['test_label'], batch_size)

# predict accuracy for lenet
acc = mx.metric.Accuracy()
lenet_model.score(test_iter, acc)
print(acc)


