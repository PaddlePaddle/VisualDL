#!/bin/bash
set -ex

mode=$1
cur=$(pwd)

backend_test() {
    cd $cur
    sudo pip install numpy
    mkdir -p build
    cd build
    cmake ..
    make
    make test
}

frontend_test() {
    cd $cur
    cd frontend
    npm install
    npm run build
}

echo "mode" $mode

if [ $mode = "backend" ]; then
    backend_test
elif [ $mode = "all" ]; then
    frontend_test
    backend_test
else
    frontend_test
fi
