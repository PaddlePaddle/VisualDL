#!/bin/bash

set -e

if [ -f "$HOME/.cargo/env" ]; then
    source $HOME/.cargo/env
fi

WORKING_PATH=`pwd`
SERVER_DIR="dist"
SERVER_DIR_PATH="$WORKING_PATH/$SERVER_DIR"
SERVERLESS_DIR="serverless"
SERVERLESS_DIR_PATH="$WORKING_PATH/$SERVERLESS_DIR"
OUTPUT="output"
OUTPUT_PATH="$WORKING_PATH/$OUTPUT"

build_server() {
    # generate dist
    rm -rf $SERVER_DIR_PATH
    mkdir -p $SERVER_DIR_PATH

    # next build
    yarn build:next

    # server build
    yarn build:server

    # move static files
    cp next.config.js $SERVER_DIR_PATH
    cp package.json $SERVER_DIR_PATH
    cp -r public $SERVER_DIR_PATH
}

build_serverless() {
    build_server

    # generate dist
    rm -rf $SERVERLESS_DIR_PATH
    mkdir -p $SERVERLESS_DIR_PATH

    # next export
    yarn export
}

# generate output
rm -rf $OUTPUT_PATH
mkdir -p $OUTPUT_PATH

# package serverless files
PUBLIC_PATH="/app" API_URL="/api" build_serverless
(cd $SERVERLESS_DIR_PATH && tar zcf $OUTPUT_PATH/serverless.tar.gz .)

# package server files
PUBLIC_PATH="" API_URL="/api" build_server
(cd $SERVER_DIR_PATH && tar zcf $OUTPUT_PATH/server.tar.gz .)
