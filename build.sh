#!/bin/bash
set -ex

TOP_DIR=$(pwd)
FRONTEND_DIR=$TOP_DIR/frontend
BACKEND_DIR=$TOP_DIR/visualdl
BUILD_DIR=$TOP_DIR/build

mkdir -p $BUILD_DIR

./dev/_init_build_env.sh "$TOP_DIR"

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
    export PATH="$PATH:$TOP_DIR/visualdl/server/protoc3/bin"
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
