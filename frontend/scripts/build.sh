#!/bin/bash

set -e

APP='visualdl'
WORKING_PATH=`pwd`
DIST_DIR='output'
DIST_PATH="$WORKING_PATH/$DIST_DIR"

# generate output
rm -rf $DIST_PATH
mkdir -p $DIST_PATH/client
mkdir -p $DIST_PATH/server
mkdir -p $DIST_PATH/maps

npm i
# nuxt build
npm run build:nuxt
# server build
npm run build:server

# Server: packaging app excluding `node_modules`
tar zcf $DIST_PATH/server/$APP.tar.gz --exclude="$DIST_DIR" --exclude='./node_modules' .

# Client
mv .nuxt/dist/client/*.map $DIST_PATH/maps/
cp -r static/* $DIST_PATH/client/
cp -r .nuxt/dist/client/* $DIST_PATH/client/
rm -f $DIST_PATH/client/README.md
cp -r $DIST_PATH/maps/*.map .nuxt/dist/client/

# clean sourcemaps
cd $DIST_PATH
tar zcf maps.tar.gz ./maps
rm -rf ./maps
