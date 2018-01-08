#!/bin/bash
set -ex

mode=$1
readonly cur=$(pwd)
readonly core_path=$cur/build/visualdl/logic
readonly python_path=$cur/visualdl/python
readonly max_file_size=1000000 # 1MB

export PYTHONPATH="${core_path}:${python_path}"

# install the visualdl wheel first
package() {
    sudo apt-get install protobuf-compiler
    cd $cur
    python setup.py bdist_wheel
    sudo pip install dist/visualdl-0.0.1-py2-none-any.whl
}

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

    cd $cur/visualdl/server
    bash graph_test.sh

    cd $cur/visualdl/server
    python lib_test.py
}

# check the size of files in the repo.
# reject PR that has some big data included.
bigfile_reject() {
    cd $cur
    # it failed to exclude .git, remove it first.
    #rm -rf .git
    local largest_file="$(find . -path .git -prune -not -name ".*" -o -printf '%s %p\n' | sort -nr | head -n1)"
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
    package
    bigfile_reject
    frontend_test
    backend_test
    server_test
elif [ $mode = "local" ]; then
    #frontend_test
    backend_test
    server_test
else
    frontend_test
fi
