#!/bin/bash
set -ex

mode=$1
readonly cur=$(pwd)
readonly core_path=$cur/build/visualdl/logic
readonly python_path=$cur/visualdl/python
readonly max_file_size=1000000 # 1MB

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

# check the size of files in the repo.
# reject PR that has some big data included.
bigfile_reject() {
    local largest_file=$(find . -path .git -prune -o -printf '%s %p\n' | sort -nr | head -n1)
    local size=$(echo $largest_file | awk '{print $1}')
    if [ "$size" -ge "$max_file_size" ]; then
        echo $largest_file
        echo "file size exceed $max_file_size"
        echo "Should not add large data or binary file."
        exit -1
    fi
}

echo "mode" $mode

if [ $mode = "backend" ]; then
    backend_test
elif [ $mode = "all" ]; then
    bigfile_reject
    frontend_test
    backend_test
    server_test
else
    frontend_test
fi
