#!/bin/bash
set -ex

CURRENT_DIR=`pwd`

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $SCRIPT_DIR/../frontend

./node_modules/.bin/webpack --watch --config tool/webpack.dev.config.js --output-path=../visualdl/server/dist &
# Track webpack pid
WEBPACKPID=$!

export PYTHONPATH=$PYTHONPATH:"$SCRIPT_DIR/.."

cd $CURRENT_DIR

{
    # Run the visualDL with local PATH
    python ${SCRIPT_DIR}/../visualdl/server/visualDL "$@"
} ||
{
    # Catch python error, clean up the webpack process.
    kill -9 $WEBPACKPID
}
