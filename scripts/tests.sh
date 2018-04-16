#!/bin/bash
set -ex

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $SCRIPT_DIR/..

mode=$1

readonly TOP_DIR=$(pwd)
readonly core_path=$TOP_DIR/build/visualdl/logic
readonly python_path=$TOP_DIR/visualdl/python
readonly max_file_size=1000000 # 1MB
# version number follow the rule of https://semver.org/
readonly version_number=`cat VERSION_NUMBER | sed 's/\([0-9]*.[0-9]*.[0-9]*\).*/\1/g'`

sudo="sudo"
pip="pip"
python="python2"

if [[ "$WITH_PYTHON3" == "ON" ]]; then
    pip="pip3"
    python="python3"
    $sudo python3 -m pip install --upgrade pip
fi

if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then sudo=""; fi

if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
		curl -O http://python-distribute.org/distribute_setup.py
		$python distribute_setup.py
		curl -O https://raw.github.com/pypa/pip/master/contrib/get-pip.py
		$python get-pip.py
fi

$sudo $pip install numpy
$sudo $pip install Flask
$sudo $pip install Pillow
$sudo $pip install six
$sudo $pip install protobuf

export PYTHONPATH="${core_path}:${python_path}"

# install the visualdl wheel first
package() {
    # some bug with frontend build
    # a environment variable to skip frontend build
    export VS_BUILD_MODE="travis-CI"

    cd $TOP_DIR/visualdl/server
    # manully install protobuf3
    curl -OL https://github.com/google/protobuf/releases/download/v3.5.0/protoc-3.5.0-linux-x86_64.zip
    unzip protoc-3.5.0-linux-x86_64.zip -d protoc3
    export PATH="$PATH:$(pwd)/protoc3/bin"
    chmod +x protoc3/bin/*


    cd $TOP_DIR
    $python setup.py bdist_wheel
    $sudo $pip install dist/visualdl-${version_number}*.whl
}

backend_test() {
    cd $TOP_DIR
    mkdir -p build
    cd build
    if [[ "$WITH_PYTHON3" == "ON" ]]; then
        cmake -DWITH_PYTHON3=ON ..
    else
        cmake ..
    fi
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
    $sudo $pip install google
    $sudo $pip install protobuf==3.5.1

    cd $TOP_DIR/visualdl/server
    bash graph_test.sh

    cd $TOP_DIR/
    $python -m visualdl.server.lib_test
}

# check the size of files in the repo.
# reject PR that has some big data included.
bigfile_reject() {
    cd $TOP_DIR
    # it failed to exclude .git, remove it first.
    rm -rf .git
    local largest_file=$(find . -path .git -prune -o -printf '%s %p\n' | sort -nr | grep -v "CycleGAN"| head -n1)
    local size=$(echo "$largest_file" | awk '{print $1}')
    if [ "$size" -ge "$max_file_size" ]; then
        echo $largest_file
        echo "file size exceed $max_file_size"
        echo "Should not add large data or binary file."
        exit -1
    fi
}

clean_env() {
    rm -rf $TOP_DIR/build
    rm -rf $TOP_DIR/dist
    rm -rf $TOP_DIR/frontend/node_modules
    rm -rf $TOP_DIR/frontend/dist
    rm -rf $TOP_DIR/visualdl/core.so
    rm -rf $TOP_DIR/visualdl/python/core.so
    rm -rf $TOP_DIR/visualdl/server/protoc3
    rm -rf $TOP_DIR/visualdl/server/protoc*.zip
}

echo "mode" $mode

if [ $mode = "backend" ]; then
    backend_test
elif [ $mode = "all" ]; then
    # Clean before test
    clean_env
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
