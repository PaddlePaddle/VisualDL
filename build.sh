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
    manifest_num=`ls dist/manifest.*.js | wc -l | awk '{$1=$1;print}'`
    echo "manifest_num"
    echo manifest_num
    if [ "$manifest_num" != "1" ]; then
      echo "dist have duplicate file, please clean and rerun"
      exit 1
    fi
}

build_frontend_fake() {
    cd $FRONTEND_DIR
    mkdir -p dist
}

build_backend() {
    cd $BUILD_DIR
    cmake .. ${PYTHON_FLAGS}
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

clean_env() {
    rm -rf $TOP_DIR/visualdl/server/dist
    rm -rf $BUILD_DIR/bdist*
    rm -rf $BUILD_DIR/lib*
    rm -rf $BUILD_DIR/temp*
    rm -rf $BUILD_DIR/scripts*
}

package() {
    cp -rf $FRONTEND_DIR/dist $TOP_DIR/visualdl/server/
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
