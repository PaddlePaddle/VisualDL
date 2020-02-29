#!/bin/bash
set -ex

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $SCRIPT_DIR/..

TOP_DIR=$(pwd)
FRONTEND_DIR=$TOP_DIR/frontend
BACKEND_DIR=$TOP_DIR/visualdl
BUILD_DIR=$TOP_DIR/build

mkdir -p $BUILD_DIR

build_frontend() {
    cd $FRONTEND_DIR
    ./scripts/build.sh
}

build_backend() {
    cd $BUILD_DIR
    if [[ $WITH_PYTHON3 ]]; then
        cmake -DWITH_PYTHON3=ON .. ${PYTHON_FLAGS}
    else
        cmake .. ${PYTHON_FLAGS}
    fi
    make -j2
}

build_onnx_graph() {
    export PATH="$BUILD_DIR/third_party/protobuf/src/extern_protobuf-build/:$PATH"
    cd $TOP_DIR/visualdl/server/onnx
    protoc onnx.proto --python_out .
}

clean_env() {
    rm -rf $TOP_DIR/visualdl/server/dist
    rm -rf $BUILD_DIR/bdist*
    rm -rf $BUILD_DIR/lib*
    rm -rf $BUILD_DIR/temp*
    rm -rf $BUILD_DIR/scripts*
}

package() {
    # deprecated, will use nodejs in docker instead
    # cp -rf $FRONTEND_DIR/dist $TOP_DIR/visualdl/server/
}

ARG=$1
echo "ARG: " $ARG

clean_env
build_frontend
build_backend
build_onnx_graph
package
