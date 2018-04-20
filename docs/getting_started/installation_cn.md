## 安装

### How to install from pypi
Visual DL提供独立的Python SDK，如果训练任务是基于Python的话，直接安装visualdl的whl包，import到自己项目中即可使用。


```
pip install --upgrade visualdl
```

### How to build and install locally
```
git clone https://github.com/PaddlePaddle/VisualDL.git
cd VisualDL

python setup.py bdist_wheel
pip install --upgrade dist/visualdl-*.whl
```
