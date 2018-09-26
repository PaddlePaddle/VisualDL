# Release VisualDL to Pypi

To release VisualDL so that user can do `pip install --upgrade visualdl`, we need to upload the package to pypi. 

We support python2.7 and python3.6, here is the pypi link to show what pip packages we have: https://pypi.org/simple/visualdl/

Make sure `build` folder is removed everytime you start building. Following build instructions are assuming you are in MacOS environment:

## Build for MacOS
In VisualDL root path, run `python setup.py bdist_wheel`.
After built successfully you will see something like `visualdl-1.2.0-cp27-cp27m-macosx_10_6_x86_64.whl` in `dist` folder.
`cp27' means python version 2.7, macosx_10_6 means it support mac OS 10.6 and above.

Make sure we build for python2.7 and python3.6, use anaconda to create python version envrionment easily.

## Build for manylinux 
To build for manylinux package, you need a manylinux docker image, please look at details in 
https://github.com/PaddlePaddle/VisualDL/blob/develop/docs/release/build_manylinux.md

## Build for Windows 
To build for windows, you need to have a windows machine and run `python setup.py bdist_wheel` as similar in building for MacOS.

## Upload 

Before upload to the final pypi website, you can first upload it to a test repo `https://testpypi.python.org/pypi` and test the installation process.
```shell
pip install twine
twine upload --repository-url https://test.pypi.org/legacy/ visualdl-*xx.whl
pip install --index-url https://test.pypi.org/simple/ your-package
```

Use twine to upload the package to pypi.
```shell
pip install twine
twine upload xx.whl
```
