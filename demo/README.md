# VisualDL demos

VisualDL supports Python and C++ based DL frameworks,
there are several demos for different platforms.

## PaddlePaddle
Locates in `./paddle`.

This is a visualization for `vgg` on `cifar10` dataset, we visualize the CONV parameters,
and there are some interesting patterns.

## PyTorch GAN
Locates in `./pytorch-CycleGAN-and-pix2pix`.

This submodule is forked from [pytorch-CycleGAN-and-pix2pix](
https://github.com/junyanz/pytorch-CycleGAN-and-pix2pix),
great model and the generated fake images are really funny.

This demo only works with CycleGAN mode, read [CycleGAN train doc](https://github.com/Superjomn/pytorch-CycleGAN-and-pix2pix#cyclegan-traintest) and [changes to the original code](https://github.com/junyanz/pytorch-CycleGAN-and-pix2pix/compare/master...Superjomn:master) for more information.

## MxNet Mnist
Locates in `./mxnet_demo`.

By adding VisualDL as callbacks to `model.fit`,
we can use the Python SDK in MxNet,
but it seems that only the outside program can only retrieve parameters in epoch callbacks,
that limits the number of steps for visualization.

## PyTorch CNN
Locates in `./pytorch`.

This shows how to use VisualDL in PyTorch for a CNN on `cifar10` dataset. We visualize the loss in Scalar,
two convolutional layers in Image, the change trend of conv1 weights in Histogram and the final model graph
in Graph.
