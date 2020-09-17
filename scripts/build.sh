#!/bin/bash
set -e

TOP_DIR=$(pwd)
FRONTEND_DIR=${TOP_DIR}/frontend
BUILD_DIR=${TOP_DIR}/build
FRONTEND_DIST="$BUILD_DIR/package/dist"

build_frontend() {
    rm -rf "$FRONTEND_DIST"
    mkdir -p "$FRONTEND_DIST"

    cd "$FRONTEND_DIR"
    . ./scripts/install.sh
    SCOPE="serverless" \
      PUBLIC_PATH="{{PUBLIC_PATH}}" \
      BASE_URI="{{BASE_URI}}" \
      API_URL="{{API_URL}}" \
      API_TOKEN_KEY="{{API_TOKEN_KEY}}" \
      TELEMETRY_ID="{{TELEMETRY_ID}}" \
      THEME="{{THEME}}" \
      PATH="$PATH" \
      ./scripts/build.sh

    # extract
    tar zxf "$FRONTEND_DIR/output/serverless.tar.gz" -C "$FRONTEND_DIST"
}

clean_env() {
    rm -rf "$TOP_DIR/visualdl/server/dist"
    rm -rf "$BUILD_DIR"
    rm -rf "$TOP_DIR/*.egg-info"
}

package() {
    cp -rf "$BUILD_DIR/package/dist" "$TOP_DIR/visualdl/server/"
}

clean_env

mkdir -p "$BUILD_DIR"

if [ -z "$USE_CACHED_FRONTEND" ] || [ ! -d "$FRONTEND_DIST" ]; then
    build_frontend
fi

package
