#!/bin/bash
set -ex

CURRENT_DIR=`pwd`

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $SCRIPT_DIR/../frontend
export PYTHONPATH=$PYTHONPATH:"$SCRIPT_DIR/.."

rm -rf ./dist
mkdir dist
npm run build

# the config is the only diff from dev_server (webpack.demo.config.js)
./node_modules/.bin/webpack --watch --config tool/webpack.demo.config.js --output-path=../visualdl/server/dist &
# Track webpack pid
WEBPACKPID=$!

function finish {
    kill -9 $WEBPACKPID
}

trap finish EXIT HUP INT QUIT PIPE TERM

cd $CURRENT_DIR

# Run the visualDL with local PATH
python ${SCRIPT_DIR}/../visualdl/server/visualdl "$@"
