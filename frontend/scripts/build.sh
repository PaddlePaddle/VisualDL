#!/bin/bash

set -e

WORKING_PATH=`pwd`
DIST_DIR='dist'
DIST_PATH="$WORKING_PATH/$DIST_DIR"

# generate dist
rm -rf $DIST_PATH
mkdir -p $DIST_PATH

yarn
# next build
yarn build:next
# server build
yarn build:server

# move static files
cp next.config.js $DIST_PATH
cp package.json $DIST_PATH
