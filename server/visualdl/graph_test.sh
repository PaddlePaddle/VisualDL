#!/bin/bash
set -ex

sudo pip install google
sudo pip install protobuf

cd mock
bash download_mock_models.sh

cd ..

python graph_test.py

rm ./mock/*.pb

