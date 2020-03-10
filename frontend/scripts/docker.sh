#!/bin/bash

set -e

./scripts/build.sh

docker build -t paddlepaddle/visualdl .
