#!/bin/bash

set -e

# path from build.sh
# if ! command -v rustup >/dev/null 2>&1; then
#     export PATH="$HOME/.cargo/bin:$PATH"
# fi

WORKING_PATH=`pwd`
SERVER_DIR="dist"
SERVER_DIR_PATH="$WORKING_PATH/$SERVER_DIR"
CLIENT_DIR="out"
CLIENT_DIR_PATH="$WORKING_PATH/$CLIENT_DIR"
OUTPUT="output"
OUTPUT_PATH="$WORKING_PATH/$OUTPUT"

# generate dist
rm -rf $SERVER_DIR_PATH
mkdir -p $SERVER_DIR_PATH
rm -rf $CLIENT_DIR_PATH
mkdir -p $CLIENT_DIR_PATH

# generate output
rm -rf $OUTPUT_PATH
mkdir -p $OUTPUT_PATH

# next build
yarn build:next

# server build
yarn build:server

# move static files
cp next.config.js $SERVER_DIR_PATH
cp package.json $SERVER_DIR_PATH

# package server files
(cd $SERVER_DIR_PATH && tar zcf $OUTPUT_PATH/server.tar.gz .)

# export
# WARNING: export LAST!!! dist files will be deleted by next after export
yarn export

# package client files
(cd $CLIENT_DIR_PATH && tar zcf $OUTPUT_PATH/client.tar.gz .)

# clean
rm -rf $SERVER_DIR_PATH
rm -rf $CLIENT_DIR_PATH
