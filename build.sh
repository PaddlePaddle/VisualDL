#!/bin/bash
set -ex

TOP_DIR=$(pwd)
FRONTEND_DIR=$TOP_DIR/frontend
BACKEND_DIR=$TOP_DIR/visualdl
BUILD_DIR=$TOP_DIR/build

mkdir -p $BUILD_DIR

build_frontend() {
    cd $FRONTEND_DIR
    if [ ! -d "dist" ]; then
      npm install
      npm run build
    fi
}

build_frontend_fake() {
    cd $FRONTEND_DIR
    mkdir -p dist
}

build_backend() {
    cd $BUILD_DIR
    cmake ..
    make -j2
}

build_onnx_graph() {

    cd $TOP_DIR/visualdl/server
    if [ ! -d protoc3 ]; then
        # manully install protobuf3
        curl -OL https://github.com/google/protobuf/releases/download/v3.1.0/protoc-3.1.0-linux-x86_64.zip
        unzip protoc-3.1.0-linux-x86_64.zip -d protoc3
        chmod +x protoc3/bin/*
    fi

    export PATH="$PATH:$(pwd)/protoc3/bin"
    # TODO(ChunweiYan) check protoc version here
    cd $TOP_DIR/visualdl/server/onnx
    protoc onnx.proto --python_out .
}

package() {
    cp -rf $FRONTEND_DIR/dist $TOP_DIR/visualdl/server/
    cp $BUILD_DIR/visualdl/logic/core.so $TOP_DIR/visualdl
    cp $BUILD_DIR/visualdl/logic/core.so $TOP_DIR/visualdl/python/
}

ARG=$1
echo "ARG: " $ARG


if [ $ARG = "travis-CI" ]; then
    build_frontend_fake
else
    build_frontend
fi

build_backend
build_onnx_graph
package
