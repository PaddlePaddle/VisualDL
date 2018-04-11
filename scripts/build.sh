#!/bin/bash
set -ex

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $SCRIPT_DIR/..

TOP_DIR=$(pwd)
FRONTEND_DIR=$TOP_DIR/frontend
BACKEND_DIR=$TOP_DIR/visualdl
BUILD_DIR=$TOP_DIR/build

mkdir -p $BUILD_DIR

check_duplicated() {
    filename_format=$1
    file_num=`ls dist/${filename_format} | wc -l | awk '{$1=$1;print}'`
    if [ "$file_num" != "1" ]; then
      echo "dist have duplicate file for $file_num, please clean and rerun"
      exit 1
    fi
}

build_frontend() {
    cd $FRONTEND_DIR
    if [ ! -d "dist" ]; then
      npm install
      npm run build
    fi
    for file_name in "manifest.*.js" "index.*.js" "vendor.*.js"; do
        echo $file_name
        check_duplicated $file_name
    done
}

build_frontend_fake() {
    cd $FRONTEND_DIR
    mkdir -p dist
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
    cp -rf $FRONTEND_DIR/dist $TOP_DIR/visualdl/server/
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
