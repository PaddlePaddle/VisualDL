#!/bin/bash
set -ex

mode=$1
readonly TOP_DIR=$(pwd)
readonly core_path=$TOP_DIR/build/visualdl/logic
readonly python_path=$TOP_DIR/visualdl/python
readonly max_file_size=1000000 # 1MB

sudo="sudo"

if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then sudo=""; fi

export PYTHONPATH="${core_path}:${python_path}"

./dev/_init_build_env.sh "$TOP_DIR"

# install the visualdl wheel first
package() {
    # some bug with frontend build
    # a environment variable to skip frontend build
    export VS_BUILD_MODE="travis-CI"

    cd $TOP_DIR
    python setup.py bdist_wheel
    $sudo pip install dist/visualdl-0.0.1-py2-none-any.whl
}

backend_test() {
    cd $TOP_DIR
    mkdir -p build
    cd build
    cmake ..
    make
    make test
}

frontend_test() {
    cd $TOP_DIR
    cd frontend
    npm install
    npm run build
}

server_test() {
    cd $TOP_DIR/visualdl/server
    bash graph_test.sh

    cd $TOP_DIR/visualdl/server
    python lib_test.py
}

# check the size of files in the repo.
# reject PR that has some big data included.
bigfile_reject() {
    cd $TOP_DIR
    # it failed to exclude .git, remove it first.
    rm -rf .git
    local largest_file="$(find . -path .git -prune -o -printf '%s %p\n' | sort -nr | head -n1)"
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
    # bigfile_reject should be tested first, or some files downloaded may fail this test.
    bigfile_reject
    package
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
