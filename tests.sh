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
    sudo pip install protobuf==3.1.0

    cd $cur/server
    bash build.sh $core_path
    cd visualdl

    bash graph_test.sh $core_path
#    cd $cur/server/visualdl
#    python lib_test.py
}

echo "mode" $mode

if [ $mode = "backend" ]; then
    backend_test
elif [ $mode = "all" ]; then
#    frontend_test
    backend_test
    server_test
else
    frontend_test
fi
