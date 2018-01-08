#!/bin/bash
set -ex

cd mock
bash download_mock_models.sh

cd ..

python graph_test.py

rm ./mock/*.pb

