#!/bin/bash

script=$(readlink -f "$0")
script_path=$(dirname "$script")

pushd $script_path
  protoc3/bin/protoc visualdl/onnx/onnx.proto --python_out .
  pb_file="visualdl/onnx/onnx_pb2.py"
  if [ -f "$pb_file" ]
  then
    echo 'exist!!'
    ls $pb_file
    echo '$$CORE_PATH'
    cp $pb_file $CORE_PATH
  else
    echo 'no!!'
  fi
  python setup.py bdist_wheel
popd
