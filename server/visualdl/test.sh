#!/bin/bash
set -ex

export PYTHONPATH="$(pwd)/..:/home/superjom/project/VisualDL/build/visualdl/logic:/home/superjom/project/VisualDL/visualdl/python"

python lib.py
