#!/bin/bash
set -ex

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $SCRIPT_DIR/../frontend
./node_modules/.bin/webpack --watch --config tool/webpack.dev.config.js --output-path=../visualdl/server/dist &

export PYTHON_PATH=$PYTHON_PATH:"$SCRIPT_DIR/.."

cd $SCRIPT_DIR/../visualdl/server
python visualDL "$@"
