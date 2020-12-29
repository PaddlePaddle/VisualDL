#!/bin/bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

PACKAGES="${SCRIPT_DIR}/../packages"

for dirname in `ls ${PACKAGES}`; do
    package="${PACKAGES}/${dirname}"
    if [ -d $package ]; then
        (cd $package && npm publish)
    fi
done
