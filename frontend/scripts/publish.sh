#!/bin/bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

PACKAGES="${SCRIPT_DIR}/../packages"

for package in "${PACKAGES}"/*; do
    if [ -d "$package" ]; then
        (cd "$package" && npm publish)
    fi
done
