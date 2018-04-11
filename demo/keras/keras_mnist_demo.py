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

from __future__ import print_function
import keras
from keras.datasets import mnist
from keras.models import Sequential
from keras.layers import Dense, Dropout, Flatten
from keras.layers import Conv2D, MaxPooling2D
from keras import backend as K

from visualdl import LogWriter

batch_size = 2000
num_classes = 10
epochs = 10

# input image dimensions
img_rows, img_cols = 28, 28

# the data, shuffled and split between train and test sets
(x_train, y_train), (x_test, y_test) = mnist.load_data()

if K.image_data_format() == 'channels_first':
    x_train = x_train.reshape(x_train.shape[0], 1, img_rows, img_cols)
    x_test = x_test.reshape(x_test.shape[0], 1, img_rows, img_cols)
    input_shape = (1, img_rows, img_cols)
else:
    x_train = x_train.reshape(x_train.shape[0], img_rows, img_cols, 1)
    x_test = x_test.reshape(x_test.shape[0], img_rows, img_cols, 1)
    input_shape = (img_rows, img_cols, 1)

x_train = x_train.astype('float32')
x_test = x_test.astype('float32')
x_train /= 255
x_test /= 255
print('x_train shape:', x_train.shape)
print(x_train.shape[0], 'train samples')
print(x_test.shape[0], 'test samples')

# convert class vectors to binary class matrices
y_train = keras.utils.to_categorical(y_train, num_classes)
y_test = keras.utils.to_categorical(y_test, num_classes)

model = Sequential()
model.add(
    Conv2D(32, kernel_size=(3, 3), activation='relu', input_shape=input_shape))
model.add(Conv2D(64, (3, 3), activation='relu'))
model.add(MaxPooling2D(pool_size=(2, 2)))
model.add(Dropout(0.25))
model.add(Flatten())
model.add(Dense(128, activation='relu'))
model.add(Dropout(0.5))
model.add(Dense(num_classes, activation='softmax'))

model.compile(
    loss=keras.losses.categorical_crossentropy,
    optimizer=keras.optimizers.Adadelta(),
    metrics=['accuracy'])

# create VisualDL logger
logdir = "/workspace"
logger = LogWriter(logdir, sync_cycle=100)

# mark the components with 'train' label.
with logger.mode("train"):
    # create a scalar component called 'scalars/'
    scalar_keras_train_loss = logger.scalar("scalars/scalar_keras_train_loss")
    image_input = logger.image("images/input", 1)
    image0 = logger.image("images/image0", 1)
    image1 = logger.image("images/image1", 1)
    histogram0 = logger.histogram("histogram/histogram0", num_buckets=50)
    histogram1 = logger.histogram("histogram/histogram1", num_buckets=50)

train_step = 0


class LossHistory(keras.callbacks.Callback):
    def on_batch_end(self, batch, logs={}):
        global train_step

        # Scalar
        scalar_keras_train_loss.add_record(train_step, logs.get('loss'))

        # get weights for 2 layers
        W0 = model.layers[0].get_weights()[0]  # 3 x 3 x 1 x 32
        W1 = model.layers[1].get_weights()[0]  # 3 x 3 x 32 x 64

        weight_array0 = W0.flatten()
        weight_array1 = W1.flatten()

        # histogram
        histogram0.add_record(train_step, weight_array0)
        histogram1.add_record(train_step, weight_array1)

        # image
        image_input.start_sampling()
        image_input.add_sample([28, 28], x_train[0].flatten())
        image_input.finish_sampling()

        image0.start_sampling()
        image0.add_sample([9, 32], weight_array0)
        image0.finish_sampling()

        image1.start_sampling()
        image1.add_sample([288, 64], weight_array1)
        image1.finish_sampling()

        train_step += 1


history = LossHistory()

model.fit(
    x_train,
    y_train,
    batch_size=batch_size,
    epochs=epochs,
    verbose=1,
    validation_data=(x_test, y_test),
    callbacks=[history])
score = model.evaluate(x_test, y_test, verbose=0)
print('Test loss:', score[0])
print('Test accuracy:', score[1])
