#!/bin/bash

set -e

WORKING_PATH=`pwd`
SERVER_DIR="dist"
SERVER_DIR_PATH="$WORKING_PATH/$SERVER_DIR"

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

# clean
rm -rf $SERVER_DIR_PATH
