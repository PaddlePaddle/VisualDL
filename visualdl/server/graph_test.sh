#!/bin/bash
set -ex

cd mock
bash download_mock_models.sh

cd ../../../

if [[ "$WITH_PYTHON3" == "ON" ]]; then
    python3 -m visualdl.server.graph_test
else
    python2 -m visualdl.server.graph_test
fi

rm visualdl/server/mock/*.pb
