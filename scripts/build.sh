#!/bin/bash
set -e

TOP_DIR=$(pwd)
FRONTEND_DIR=$TOP_DIR/frontend
BACKEND_DIR=$TOP_DIR/visualdl
BUILD_DIR=$TOP_DIR/build

mkdir -p $BUILD_DIR

build_frontend() {
    cd $FRONTEND_DIR
    PUBLIC_PATH="/app" API_URL="/api" ./scripts/build.sh
}

build_frontend_fake() {
    cd $FRONTEND_DIR
    mkdir -p out
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
    cd $TOP_DIR/visualdl/server/model/onnx
    protoc onnx.proto --python_out .
    cd $TOP_DIR/visualdl/server/model/paddle
    protoc framework.proto --python_out .
}

clean_env() {
    rm -rf $TOP_DIR/visualdl/server/dist
    rm -rf $BUILD_DIR/bdist*
    rm -rf $BUILD_DIR/lib*
    rm -rf $BUILD_DIR/temp*
    rm -rf $BUILD_DIR/scripts*
}

package() {
    mkdir -p $TOP_DIR/visualdl/server/dist
    cp -rf $FRONTEND_DIR/out/* $TOP_DIR/visualdl/server/dist
    cp $BUILD_DIR/visualdl/logic/core.so $TOP_DIR/visualdl
    cp $BUILD_DIR/visualdl/logic/core.so $TOP_DIR/visualdl/python/
}

ARG=$1
echo "ARG: " $ARG

if [ "$ARG" = "travis-CI" ]; then
    build_frontend_fake
else
    build_frontend
fi

clean_env
build_backend
build_onnx_graph
package
