#!/bin/bash
set -ex

mode=$1
readonly cur=$(pwd)
readonly core_path=$cur/build/visualdl/logic
readonly python_path=$cur/visualdl/python

export PYTHONPATH="${core_path}:${python_path}"

backend_test() {
    cd $cur
    sudo pip install numpy
    sudo pip install Pillow
    mkdir -p build
    cd build
    cmake ..
    make
    make test
}

frontend_test() {
    cd $cur
    cd frontend
    npm install
    npm run build
}

server_test() {
    sudo pip install google
    sudo pip install protobuf
    sudo pip install onnx
    sudo apt-get install protobuf-compiler

    cd $cur/server
    bash build.sh
    cd $cur/server/visualdl
    python lib_test.py
    bash graph_test.sh
}

echo "mode" $mode

if [ $mode = "backend" ]; then
    backend_test
elif [ $mode = "all" ]; then
    frontend_test
    backend_test
    server_test
else
    frontend_test
fi
