#!/bin/bash
set -ex

cd mock
bash download_mock_models.sh

cd ../../../

python -m visualdl.server.graph_test

rm visualdl/server/mock/*.pb
