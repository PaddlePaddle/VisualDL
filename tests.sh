#!/bin/bash
set -ex

sudo pip install numpy -y
#sudo apt-get install --only-upgrade cmake -y
mkdir -p build
cd build
cmake ..
make
make test

if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then bash ./travis/run_on_pull_requests; fi
if [ "$TRAVIS_PULL_REQUEST" = "false" ]; then bash ./travis/run_on_non_pull_requests; fi
