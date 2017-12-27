#!/bin/bash
set -ex

export PYTHONPATH="$(pwd)/..:/home/superjom/project/VisualDL/build/visualdl/logic:/home/superjom/project/VisualDL/visualdl/python"
export FLASK_APP=visual_dl.py
export FLASK_DEBUG=1

python visual_dl.py --logdir ./tmp/mock --host 172.23.233.68 --port 8041
