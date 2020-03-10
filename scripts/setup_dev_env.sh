#!/bin/bash
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $SCRIPT_DIR/..
mkdir -p build
cd build

which node >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "You need to install nodejs"
    exit 1
fi

echo "Setting up nodejs dependencies"
npm install visualdl@latest --no-package-lock

processors=1
if [ "$(uname)" == "Darwin" ]; then
    processors=`sysctl -n hw.ncpu`
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    processors=`nproc`
fi

echo "Building VisualDL SDK"
cmake ..

make -j $processors

export PYTHONPATH=$PYTHONPATH:"$SCRIPT_DIR/.."
