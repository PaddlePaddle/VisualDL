#!/bin/bash

PYTHON_FLAGS=""
if [ "$1" != "" ]; then
    echo "using python abi: $1"
    if [ "$1" == "cp27-cp27m" ]; then
        export LD_LIBRARY_PATH=/opt/_internal/cpython-2.7.11-ucs2/lib:${LD_LIBRARY_PATH#/opt/_internal/cpython-2.7.11-ucs4/lib:}
        export PATH=/opt/python/cp27-cp27m/bin/:${PATH}
        export PYTHON_FLAGS="-DPYTHON_EXECUTABLE:FILEPATH=/opt/python/cp27-cp27m/bin/python
                             -DPYTHON_INCLUDE_DIR:PATH=/opt/python/cp27-cp27m/include/python2.7
                             -DPYTHON_LIBRARIES:FILEPATH=/opt/_internal/cpython-2.7.11-ucs2/lib/libpython2.7.so"
    elif [ "$1" == "cp27-cp27mu" ]; then
        export LD_LIBRARY_PATH=/opt/_internal/cpython-2.7.11-ucs4/lib:${LD_LIBRARY_PATH#/opt/_internal/cpython-2.7.11-ucs2/lib:}
        export PATH=/opt/python/cp27-cp27mu/bin/:${PATH}
        export PYTHON_FLAGS="-DPYTHON_EXECUTABLE:FILEPATH=/opt/python/cp27-cp27mu/bin/python
                             -DPYTHON_INCLUDE_DIR:PATH=/opt/python/cp27-cp27mu/include/python2.7
                             -DPYTHON_LIBRARIES:FILEPATH=/opt/_internal/cpython-2.7.11-ucs4/lib/libpython2.7.so"
    fi
fi

echo $LD_LIBRARY_PATH
echo $PATH
echo $PYTHON_FLAGS

python setup.py bdist_wheel
