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
    curl -OL https://github.com/google/protobuf/releases/download/v3.1.0/protoc-3.1.0-linux-x86_64.zip
    unzip protoc-3.1.0-linux-x86_64.zip -d protoc3
    export PATH=$PATH:protoc3/bin
    sudo chmod +x protoc3/bin/protoc
    sudo chown `whoami` protoc3/bin/protoc

    bash build.sh

    cd visualdl
    bash graph_test.sh

    cd $cur/server/visualdl
    python lib_test.py
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
