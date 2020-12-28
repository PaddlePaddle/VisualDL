#!/bin/bash

set -e

echo $0

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $SCRIPT_DIR/..

./node_modules/.bin/lint-staged --no-stash
