#!/bin/bash
set -ex

readonly TOP_DIR=$1
sudo=""

if [ -z "$TOP_DIR" ]; then
    echo "ARG TOP_DIR should be passed"
    exit -1
fi
if [ ! -d "$TOP_DIR"]; then
    echo "directory " $TOP_DIR " not exists"
    exit -1
fi

# BUG this code not works
if [[ "$TRAVIS_OS_NAME" == "osx" ]]; then 
		curl -O http://python-distribute.org/distribute_setup.py
		python distribute_setup.py
		curl -O https://raw.github.com/pypa/pip/master/contrib/get-pip.py
		python get-pip.py
else
    sudo="sudo"
fi

$sudo pip install numpy
$sudo pip install Flask
$sudo pip install Pillow
$sudo pip install protobuf
$sudo apt-get install graphviz
$sudo pip install google
# TODO(ChunweiYan) is this duplicate install?
$sudo pip install protobuf==3.1.0


# # manully install protobuf3
# cd $TOP_DIR/visualdl/server
# if [ ! -d protoc3 ]; then
#     # manully install protobuf3
#     curl -OL https://github.com/google/protobuf/releases/download/v3.1.0/protoc-3.1.0-linux-x86_64.zip
#     unzip protoc-3.1.0-linux-x86_64.zip -d protoc3
#     chmod +x protoc3/bin/*
# fi
