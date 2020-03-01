#!/bin/bash

set -e

if [ ! -d dist ]; then
    echo "Please build first!"
    exit 1
fi

docker build -t paddlepaddle/visualdl .
