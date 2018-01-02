#!/bin/bash
set -ex

CORE_PATH=$1

cd mock
bash download_mock_models.sh

cd ..

cp "$CORE_PATH/onnx_pb2.py" onnx

python graph_test.py

rm ./mock/*.pb

