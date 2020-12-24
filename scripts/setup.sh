#!/bin/bash
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $SCRIPT_DIR/..

which python > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "You need to install Python 3.5+"
    exit 1
fi
python --version

which node > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "You need to install nodejs 14+"
    exit 1
fi
node --version

pip install pre-commit && pre-commit install
pip install --disable-pip-version-check -r requirements.txt
(cd frontend && scripts/install.sh)
