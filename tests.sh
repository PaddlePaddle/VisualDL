#!/bin/bash
set -ex

mode=$1

backend_test() {
    sudo pip install numpy
    mkdir -p build
    cd build
    cmake ..
    make
    make test
}

frontend_test() {
    cd frontend
    npm install
    npm run build
}

echo "mode" $mode

if [ $mode = "backend" ]; then
    backend_test
else
    frontend_test
fi
