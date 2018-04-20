# Installation

### How to install from pypi

```
# Install the VisualDL. Preferably under a virtual environment or anaconda.
pip install --upgrade visualdl

# run a demo, vdl_create_scratch_log will create logs for testing.
vdl_create_scratch_log
visualDL --logdir=scratch_log --port=8080

# visit http://127.0.0.1:8080
```

If you run into issues in above steps, it could be error caused by environmental issues by different python or pip versions.
Following installation methods might fix the issues.

## Install with Virtualenv

[Virtualenv](https://virtualenv.pypa.io/en/stable/) creates isolated Python environment that prevents interfering
by other Python programs on the same machine and make sure Python and pip are located properly.

On macOS, install pip and virtualenv by:
```
sudo easy_install pip
pip install --upgrade virtualenv
```

On Linux, install pip and virtualenv by:
```
sudo apt-get install python3-pip python3-dev python-virtualenv
```

Then create a Virtualenv environment by one of following command:
```
virtualenv ~/vdl  # for Python2.7
virtualenv -p python3 ~/vdl for Python 3.x
```

```~/vdl``` will be your Virtualenv directory, you may choose to install anywhere.

Activate your Virtualenv environment by:
```
source ~/vdl/bin/activate
```

Now you should be able to install VisualDL and run our demo:

```
pip install --upgrade visualdl

# run a demo, vdl_create_scratch_log will create logs for testing.
vdl_create_scratch_log
visualDL --logdir=scratch_log --port=8080

# visit http://127.0.0.1:8080
```

If you still have issues installing VisualDL from Virtualenv, try following installation method.


## Install with Anaconda

Anaconda is a python distribution, with installation and package management tools. Also it is an environment manager,
which provides the facility to create different python environments, each with their own settings.

Follow the instructions on the [Anaconda download site](https://www.anaconda.com/download) to download and install Anaconda.
Download Python 3.6 version command-Line installer.

Create a conda environment named ```vdl``` or anything you want by:
```
conda create -n vdl pip python=2.7 # or python=3.3, etc.
```

Activate the conda environment by:
```
source activate vdl
```

Now you should be able to install VisualDL and run our demo:

```
pip install --upgrade visualdl

# run a demo, vdl_create_scratch_log will create logs for testing.
vdl_create_scratch_log
visualDL --logdir=scratch_log --port=8080

# visit http://127.0.0.1:8080
```

If you still have issues installing VisualDL, try installing from sources as in following section.


## Install from source
```
#Preferably under a virtualenv or anaconda.
git clone https://github.com/PaddlePaddle/VisualDL.git
cd VisualDL

python setup.py bdist_wheel
pip install --upgrade dist/visualdl-*.whl
```

If there are still issues regarding the ```pip install```, you can still start Visual DL by starting the dev server
[here](https://github.com/PaddlePaddle/VisualDL/blob/develop/docs/how_to_dev_frontend_en.md)
