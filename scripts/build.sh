#!/bin/bash
set -e

TOP_DIR=$(pwd)
FRONTEND_DIR=${TOP_DIR}/frontend
BUILD_DIR=${TOP_DIR}/build

mkdir -p "$BUILD_DIR"

build_frontend_fake() {
    mkdir -p "$BUILD_DIR/package/dist"
}

build_frontend() {
    mkdir -p "$BUILD_DIR/package/dist"

    cd "$FRONTEND_DIR"
    . ./scripts/install.sh
    SCOPE="serverless" PUBLIC_PATH="/{{PUBLIC_PATH}}" API_URL="/{{PUBLIC_PATH}}/api" API_TOKEN_KEY="{{API_TOKEN_KEY}}" PATH="$PATH" ./scripts/build.sh

    # extract
    tar zxf "$FRONTEND_DIR/output/serverless.tar.gz" -C "$BUILD_DIR/package/dist"
}

clean_env() {
    rm -rf "$TOP_DIR/visualdl/server/dist"
    rm -rf "$BUILD_DIR/bdist*"
    rm -rf "$BUILD_DIR/lib*"
    rm -rf "$BUILD_DIR/package"
}

package() {
    cp -rf "$BUILD_DIR/package/dist" "$TOP_DIR/visualdl/server/"
}

ARG=$1
echo "ARG: ${ARG}"

clean_env

if [[ "$ARG" = "travis-CI" ]]; then
    build_frontend_fake
else
    build_frontend
fi

package
