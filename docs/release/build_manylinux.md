VisualDL uses the same manylinux environment docker image with PaddlePaddle, the related wiki is <https://github.com/PaddlePaddle/Paddle/tree/develop/tools/manylinux1>.

We can use this [build file](https://github.com/PaddlePaddle/Paddle/blob/develop/tools/manylinux1/build_scripts/build.sh) to build this manylinux environment. But most of the time, we can directly use `paddlepaddle/paddle_manylinux_devel:cuda8.0_cudnn5`.

You can use this [check script](https://github.com/PaddlePaddle/Paddle/blob/develop/tools/manylinux1/build_scripts/manylinux1-check.py) to check the build envrionment.

The whole build step can be:

1. Get the manyliux build docker image `paddlepaddle/paddle_manylinux_devel:cuda8.0_cudnn5` and enter.

    ```shell
    docker run -it paddlepaddle/paddle_manylinux_devel:cuda8.0_cudnn5 /bin/bash
    ```

1. Get the VisualDL code and run build.sh. It will generate a whl file like `visualdl-0.0.2a0-cp27-cp27m(u)-linux_x86_64.whl`

1. The `linux` above should be renamed to `manylinux1`

    ```shell
    mv visualdl-0.0.2a0-cp27-cp27m-linux_x86_64.whl visualdl-0.0.2a0-cp27-cp27m-
    manylinux1_x86_64.whl
    ```
1. Before upload to the final pypi website, you can first upload it to a test repo `https://testpypi.python.org/pypi` and test the installation process.
    ```shell
    pip install twine
    twine upload --repository-url https://test.pypi.org/legacy/ visualdl-*xx.whl
    pip install --index-url https://test.pypi.org/simple/ your-package
    ```

1. Use twine to upload the package to pypi.
    ```shell
    pip install twine
    twine upload xx.whl
    ```
