#!/bin/bash
set -ex

TOP_DIR=$(pwd)
FRONTEND_DIR=$TOP_DIR/frontend
BACKEND_DIR=$TOP_DIR/visualdl
BUILD_DIR=$TOP_DIR/build

mkdir -p $BUILD_DIR

build_frontend() {
    cd $FRONTEND_DIR
    npm install
    npm run build
}

build_backend() {
    cd $BUILD_DIR
    cmake ..
    make -j2
}

build_onnx_graph() {
    cd $TOP_DIR/visualdl/server/onnx
    protoc onnx.proto --python_out .
}

package() {
    cp -rf $FRONTEND_DIR/dist $TOP_DIR/visualdl/server/
    cp $BUILD_DIR/visualdl/logic/core.so $TOP_DIR/visualdl
    cp $BUILD_DIR/visualdl/logic/core.so $TOP_DIR/visualdl/python/
}

# package() {
#     cd $TOP_DIR
#     mkdir -p pip_package/visualdl
#     cd pip_package
#     touch __init__.py
#     cd visualdl
#     touch __init__.py

#     cp -rf $BACKEND_DIR/python/*.py .
#     cp -rf $BACKEND_DIR/server .
#     cp $BUILD_DIR/visualdl/logic/core.so .
# }

#build_frontend
build_backend
build_onnx_graph
package
