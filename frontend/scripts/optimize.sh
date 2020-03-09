#!/bin/bash

set -e

which "wasm-opt" >/dev/null 2>&1
if [ "$?" -ne "0" ]; then
    echo "wasm-opt not found!"
    exit 1
fi

WASM_DIR="dist/static/wasm"

for file in "$WASM_DIR/*.wasm"
do
    echo "optimizing $file"
    wasm-opt -O -o $file $file
done
