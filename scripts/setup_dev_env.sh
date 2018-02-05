#!/bin/bash
set -ex

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Setting up nodejs dependencies"
cd $SCRIPT_DIR/../frontend
npm install

processors=1
if [ "$(uname)" == "Darwin" ]; then
    processors=`sysctl -n hw.ncpu`
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    processors=`nproc`
fi

echo "Building VisualDL SDK"
cd $SCRIPT_DIR/..
mkdir -p build
cd build
cmake ..
make -j $processors

export PYTHONPATH=$PYTHONPATH:"$SCRIPT_DIR/.."
