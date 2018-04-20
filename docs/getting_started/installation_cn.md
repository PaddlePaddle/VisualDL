# 安装

### 使用PIP安装
Visual DL提供独立的Python SDK，如果训练任务是基于Python的话，直接安装visualdl的whl包，import到自己项目中即可使用。

```
# Install the VisualDL. Preferably under a virtual environment or anaconda.
pip install --upgrade visualdl

# run a demo, vdl_create_scratch_log will create logs for testing.
vdl_create_scratch_log
visualDL --logdir=scratch_log --port=8080

# visit http://127.0.0.1:8080
```

如果以上步骤出现问题，很可能是因为python或pip不同版本或不同位置所致，以下安装方法能解决。

## 使用 virtualenv 安装

[Virtualenv](https://virtualenv.pypa.io/en/stable/) 能创建独立Python环境，也能确保Python和pip的相对位置正确。

在macOS上，安装pip和virtualenv如下：
```
sudo easy_install pip
pip install --upgrade virtualenv
```

在Linux上，安装pip和virtualenv如下:
```
sudo apt-get install python3-pip python3-dev python-virtualenv
```

然后创建一个虚拟环境：
```
virtualenv ~/vdl  # for Python2.7
virtualenv -p python3 ~/vdl for Python 3.x
```

```~/vdl``` 是你的Virtualenv目录, 你也可以选择任一目录。

激活虚拟环境如下：
```
source ~/vdl/bin/activate
```

现在再安装 VisualDL 和运行范例：

```
pip install --upgrade visualdl

# 运行一个例子，vdl_create_scratch_log 将创建测试日志
vdl_create_scratch_log
visualDL --logdir=scratch_log --port=8080

# 访问 http://127.0.0.1:8080
```

如果在虚拟环境下仍然遇到安装问题，请尝试以下方法。


## 使用 Anaconda 安装

Anaconda是一个用于科学计算的Python发行版，提供了包管理与环境管理的功能，可以很方便地解决多版本python并存、切换以及各种第三方包安装问题。

请根据[Anaconda下载网站](https://www.anaconda.com/download) 的指示去下载和安装Anaconda.
下载Python 3.6版本的command-Line installer.

创建conda环境名字为```vdl```或任何名字:
```
conda create -n vdl pip python=2.7 # or python=3.3, etc.
```

激活conda环境如下:
```
source activate vdl
```

现在再安装 VisualDL 和运行范例：

```
pip install --upgrade visualdl

# 运行一个例子，vdl_create_scratch_log 将创建测试日志
vdl_create_scratch_log
visualDL --logdir=scratch_log --port=8080

# 访问 http://127.0.0.1:8080
```

如果仍然遇到安装问题，请尝试以下用源代码安装方法。

## 使用代码安装
```
#建議是在虚拟环境或anaconda下。
git clone https://github.com/PaddlePaddle/VisualDL.git
cd VisualDL

python setup.py bdist_wheel
pip install --upgrade dist/visualdl-*.whl
```

如果打包和安装遇到其他问题，不安装只想运行Visual DL可以看[这里](https://github.com/PaddlePaddle/VisualDL/blob/develop/docs/how_to_dev_frontend_en.md)
