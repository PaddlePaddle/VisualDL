#!/bin/bash

set -e

WORKING_PATH=$(pwd)
SERVER_DIR="packages/server"
SERVER_DIR_PATH="$WORKING_PATH/$SERVER_DIR"
SERVERLESS_DIR="packages/core/dist"
SERVERLESS_DIR_PATH="$WORKING_PATH/$SERVERLESS_DIR"
OUTPUT="output"
OUTPUT_PATH="$WORKING_PATH/$OUTPUT"

if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
fi

# clean
yarn clean

# build
if [ "$SCOPE" = "serverless" ]; then
    npx lerna run --scope "@visualdl/core" --include-dependencies build
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
    tar zcf "${OUTPUT_PATH}/server.tar.gz" --exclude="node_modules" --exclude=".gitignore" --exclude=".DS_Store" --dereference -C "$SERVER_DIR_PATH" .
fi

# package serverless files
if [ -d "$SERVERLESS_DIR_PATH" ]; then
    tar zcf "${OUTPUT_PATH}/serverless.tar.gz" -C "$SERVERLESS_DIR_PATH" .
fi
