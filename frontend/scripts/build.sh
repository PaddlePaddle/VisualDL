#!/bin/bash

set -e

WORKING_PATH=`pwd`
SERVER_DIR="packages/server/dist"
SERVER_DIR_PATH="$WORKING_PATH/$SERVER_DIR"
SERVERLESS_DIR="packages/serverless/dist"
SERVERLESS_DIR_PATH="$WORKING_PATH/$SERVERLESS_DIR"
OUTPUT="output"
OUTPUT_PATH="$WORKING_PATH/$OUTPUT"

# build
npx lerna run build

# generate output
rm -rf $OUTPUT_PATH
mkdir -p $OUTPUT_PATH

# package server files
(cd $SERVER_DIR_PATH && tar zcf $OUTPUT_PATH/server.tar.gz .)

# package serverless files
(cd $SERVERLESS_DIR_PATH && tar zcf $OUTPUT_PATH/serverless.tar.gz .)
