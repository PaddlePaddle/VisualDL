#!/bin/bash

set -e

WORKING_PATH=$(pwd)
SERVER_DIR="packages/server/dist"
SERVER_DIR_PATH="$WORKING_PATH/$SERVER_DIR"
SERVERLESS_DIR="packages/serverless/dist"
SERVERLESS_DIR_PATH="$WORKING_PATH/$SERVERLESS_DIR"
OUTPUT="output"
OUTPUT_PATH="$WORKING_PATH/$OUTPUT"

# clean
yarn clean

# build
if [ "$SCOPE" = "serverless" ]; then
    npx lerna run --scope "@visualdl/serverless" --include-dependencies build
elif [ "$SCOPE" = "server" ]; then
    npx lerna run --scope "@visualdl/server" --include-dependencies build
elif [ "$SCOPE" = "cli" ]; then
    npx lerna run --scope "@visualdl/cli" --include-dependencies build
else
    npx lerna run build
fi

# generate output
rm -rf "$OUTPUT_PATH"
mkdir -p "$OUTPUT_PATH"

# package server files
if [ -d "$SERVER_DIR_PATH" ]; then
    (cd "$SERVER_DIR_PATH" && tar zcf "${OUTPUT_PATH}/server.tar.gz" .)
fi

# package serverless files
if [ -d "$SERVERLESS_DIR_PATH" ]; then
    (cd "$SERVERLESS_DIR_PATH" && tar zcf "${OUTPUT_PATH}/serverless.tar.gz" .)
fi
