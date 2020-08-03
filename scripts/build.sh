#!/bin/bash
set -e

TOP_DIR=$(pwd)
FRONTEND_DIR=${TOP_DIR}/frontend
BUILD_DIR=${TOP_DIR}/build
FRONTEND_DIST="$BUILD_DIR/package/dist"

mkdir -p "$BUILD_DIR"

build_frontend() {
    rm -rf "$FRONTEND_DIST"
    mkdir -p "$FRONTEND_DIST"

    cd "$FRONTEND_DIR"
    . ./scripts/install.sh
    SCOPE="serverless" PUBLIC_PATH="/{{PUBLIC_PATH}}" API_URL="/{{PUBLIC_PATH}}/api" API_TOKEN_KEY="{{API_TOKEN_KEY}}" PATH="$PATH" ./scripts/build.sh

    # extract
    tar zxf "$FRONTEND_DIR/output/serverless.tar.gz" -C "$FRONTEND_DIST"
}

clean_env() {
    rm -rf "$TOP_DIR/visualdl/server/dist"
    rm -rf "$BUILD_DIR/bdist*"
    rm -rf "$BUILD_DIR/lib*"
}

package() {
    cp -rf "$BUILD_DIR/package/dist" "$TOP_DIR/visualdl/server/"
}

clean_env

if [ -z "$USE_CACHED_FRONTEND" ] || [ ! -d "$FRONTEND_DIST" ]; then
    build_frontend
fi

package
