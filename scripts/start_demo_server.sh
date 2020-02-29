#!/bin/bash
set -ex

CURRENT_DIR=`pwd`

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $SCRIPT_DIR/../frontend
export PYTHONPATH=$PYTHONPATH:"$SCRIPT_DIR/.."

./scripts/build.sh

# TODO: use docker to start frontend enviroment
yarn start
# Track pid
FRONTEND_PID=$!

function finish {
    kill -9 $FRONTEND_PID
}

trap finish EXIT HUP INT QUIT PIPE TERM

cd $CURRENT_DIR

# Run the visualDL with local PATH
python ${SCRIPT_DIR}/../visualdl/server/visualdl "$@"
