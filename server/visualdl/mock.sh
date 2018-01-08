#!/bin/bash
set -ex

export PYTHONPATH="/home/superjom/project/VisualDL/build/visualdl/logic:/home/superjom/project/VisualDL/visualdl/python"

python lib_test.py -v
