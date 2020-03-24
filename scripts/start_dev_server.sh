#!/bin/bash
set -e

ORIGINAL_ARGS="$@"

ARGS=`getopt --long host:,port: -n 'start_dev_server.sh' -- "$@"`

if [ $? != 0 ]; then
    echo "Get arguments failed!" >&2
    cd $CWD
    exit 1
fi

PORT=8040
HOST="localhost"

eval set -- "$ARGS"

while true
do
    case "$1" in
        --host)
            HOST="$2"
            shift 2
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        --)
            shift
            break
            ;;
        *)
            break
            ;;
    esac
done

CURRENT_DIR=`pwd`

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

export PYTHONPATH=$PYTHONPATH:"$SCRIPT_DIR/.."

FRONTEND_PORT=8999
VDL_BIN="./build/node_modules/.bin/visualdl"
$VDL_BIN start --port=$FRONTEND_PORT --host=$HOST --backend="http://$HOST:$PORT"

function finish {
    $VDL_BIN stop
}

trap finish EXIT HUP INT QUIT PIPE TERM

cd $CURRENT_DIR

echo "Development server ready on http://$HOST:$FRONTEND_PORT"

# Run the visualDL with local PATH
python ${SCRIPT_DIR}/../visualdl/server/app.py "$ORIGINAL_ARGS"
