#!/bin/bash
set -e

TOP_DIR=$(pwd)
FRONTEND_DIR=$TOP_DIR/frontend
BACKEND_DIR=$TOP_DIR/visualdl
BUILD_DIR=$TOP_DIR/build

mkdir -p $BUILD_DIR

build_frontend_fake() {
    mkdir -p "$BUILD_DIR/package/serverless"
}

build_frontend_from_source() {
    build_frontend_fake

    cd $FRONTEND_DIR
    ./scripts/install.sh
    ./scripts/build.sh

    # extract
    tar zxf "$FRONTEND_DIR/output/serverless.tar.gz" -C "$BUILD_DIR/package/serverless"
}

build_frontend() {
    local PACKAGE="visualdl"
    local TAG="latest"
    local TARBALL="${PACKAGE}@${TAG}"

    # get version
    local VERSION=`npm view ${TARBALL} dist-tags.${TAG}`
    if [ "$?" -ne "0" ]; then
        echo "Cannot get version"
        exit 1
    fi
    local FILENAME="${PACKAGE}-${VERSION}.tgz"

    # get sha1sum
    local SHA1SUM=`npm view ${TARBALL} dist.shasum`
    if [ "$?" -ne "0" ]; then
        echo "Cannot get sha1sum"
        exit 1
    fi
    rm -f "$BUILD_DIR/${PACKAGE}-*.tgz.sha1"
    echo "${SHA1SUM} ${FILENAME}" > "$BUILD_DIR/${FILENAME}.sha1"

    local DOWNLOAD="1"
    # cached file exists
    if [ -f "$BUILD_DIR/$FILENAME" ]; then
        # check sha1sum
        (cd $BUILD_DIR && sha1sum -c "${FILENAME}.sha1")
        # check pass, use chached file
        if [ "$?" -eq "0" ]; then
            echo "Using cached npm package file ${FILENAME}"
            DOWNLOAD="0"
        fi
    fi

    if [ "$DOWNLOAD" -eq "1" ]; then
        echo "Donwloading npm package, please wait..."

        # remove cache
        rm -f "$BUILD_DIR/${PACKAGE}-*.tgz"

        # download file
        FILENAME=`(cd $BUILD_DIR && npm pack ${TARBALL})`

        # check sha1sum of downloaded file
        (cd $BUILD_DIR && sha1sum -c "${FILENAME}.sha1")
        if [ "$?" -ne "0" ]; then
            echo "Check sum failed, download may not finish correctly."
            exit 1
        else
            echo "Check sum pass."
        fi
    fi

    # extract
    tar zxf "$BUILD_DIR/$FILENAME" -C "$BUILD_DIR"
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
