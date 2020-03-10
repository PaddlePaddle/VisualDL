#!/bin/bash
set -e

TOP_DIR=$(pwd)
FRONTEND_DIR=$TOP_DIR/frontend
BACKEND_DIR=$TOP_DIR/visualdl
BUILD_DIR=$TOP_DIR/build

mkdir -p $BUILD_DIR

build_frontend_from_source() {
    cd $FRONTEND_DIR
    PUBLIC_PATH="/app" API_URL="/api" ./scripts/build.sh
}

build_frontend() {
    local PACKAGE_NAME="visualdl"
    local SRC=`npm view ${PACKAGE_NAME} dist.tarball`
    wget $SRC -O "$BUILD_DIR/$PACKAGE_NAME.tar.gz"
    tar zxf "$BUILD_DIR/$PACKAGE_NAME.tar.gz" -C "$BUILD_DIR"
}

build_frontend_fake() {
    mkdir -p "$BUILD_DIR/package/serverless"
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
    rm -rf $BUILD_DIR/*.tar.gz
    rm -rf $BUILD_DIR/package
}

package() {
    mkdir -p $TOP_DIR/visualdl/server/dist
    cp -rf $BUILD_DIR/package/serverless/* $TOP_DIR/visualdl/server/dist
    cp $BUILD_DIR/visualdl/logic/core.so $TOP_DIR/visualdl
    cp $BUILD_DIR/visualdl/logic/core.so $TOP_DIR/visualdl/python/
}

ARG=$1
echo "ARG: " $ARG

clean_env

if [ "$ARG" = "travis-CI" ]; then
    build_frontend_fake
else
    build_frontend
fi

build_backend
build_onnx_graph
package
