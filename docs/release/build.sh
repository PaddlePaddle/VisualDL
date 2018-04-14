#!/bin/bash

# Please execute this script from VisualDL root folder

PYTHON_FLAGS=""
if [ "$1" != "" ]; then
    echo "using python abi: $1"
    if [ "$1" == "cp27-cp27m" ]; then
        PYTHON_EXECUTABLE=/opt/python/cp27-cp27m/bin/python
        PIP_EXECUTABLE=/opt/python/cp27-cp27m/bin/pip
        export LD_LIBRARY_PATH=/opt/_internal/cpython-2.7.11-ucs2/lib:${LD_LIBRARY_PATH#/opt/_internal/cpython-2.7.11-ucs4/lib:}
        export PATH=/opt/python/cp27-cp27m/bin/:${PATH}
        export PYTHON_FLAGS="-DPYTHON_EXECUTABLE:FILEPATH=/opt/python/cp27-cp27m/bin/python
        -DPYTHON_INCLUDE_DIR:PATH=/opt/python/cp27-cp27m/include/python2.7
        -DPYTHON_LIBRARIES:FILEPATH=/opt/_internal/cpython-2.7.11-ucs2/lib/libpython2.7.so"
    elif [ "$1" == "cp27-cp27mu" ]; then
        PYTHON_EXECUTABLE=/opt/python/cp27-cp27mu/bin/python
        PIP_EXECUTABLE=/opt/python/cp27-cp27mu/bin/pip
        export LD_LIBRARY_PATH=/opt/_internal/cpython-2.7.11-ucs4/lib:${LD_LIBRARY_PATH#/opt/_internal/cpython-2.7.11-ucs2/lib:}
        export PATH=/opt/python/cp27-cp27mu/bin/:${PATH}
        export PYTHON_FLAGS="-DPYTHON_EXECUTABLE:FILEPATH=/opt/python/cp27-cp27mu/bin/python
        -DPYTHON_INCLUDE_DIR:PATH=/opt/python/cp27-cp27mu/include/python2.7
        -DPYTHON_LIBRARIES:FILEPATH=/opt/_internal/cpython-2.7.11-ucs4/lib/libpython2.7.so"
        # elif [ "$1" == "cp35-cp35m" ]; then
        #     export LD_LIBRARY_PATH=/opt/_internal/cpython-3.5.1/lib:${LD_LIBRARY_PATH#/opt/_internal/cpython-3.5.1/lib:}
        #     export PATH=/opt/python/cp35-cp35m/bin/:${PATH}
        #     export PYTHON_FLAGS="-DPYTHON_EXECUTABLE:FILEPATH=/opt/python/cp35-cp35m/bin/python
        #                          -DPYTHON_INCLUDE_DIR:PATH=/opt/python/cp35-cp35m/include/python3.5m
        #                          -DPYTHON_LIBRARIES:FILEPATH=/opt/_internal/cpython-3.5.1/lib/libpython3.so"
    elif [ "$1" == "cp34-cp34m" ]; then
        PYTHON_EXECUTABLE=/usr/bin/python3.4
        PIP_EXECUTABLE=/usr/bin/pip3.4
        export LD_LIBRARY_PATH=/usr/lib64:${LD_LIBRARY_PATH}
        export PYTHON_FLAGS="-DPYTHON_EXECUTABLE:FILEPATH=/usr/bin/python3.4
        -DPYTHON_INCLUDE_DIR:PATH=/usr/include/python3.4m
        -DPYTHON_LIBRARIES:FILEPATH=/usr/lib64/libpython3.4m.so"
    elif [ "$1" == "cp35-cp35m" ]; then
        PYTHON_EXECUTABLE=/usr/bin/python3.5
        PIP_EXECUTABLE=/usr/bin/pip3.5
        export LD_LIBRARY_PATH=/usr/lib64:${LD_LIBRARY_PATH}
        export PYTHON_FLAGS="-DPYTHON_EXECUTABLE:FILEPATH=/usr/bin/python3.5
        -DPYTHON_INCLUDE_DIR:PATH=/usr/include/python3.5m
        -DPYTHON_LIBRARIES:FILEPATH=/usr/lib64/libpython3.5m.so"
    elif [ "$1" == "cp36-cp36m" ]; then
        PYTHON_EXECUTABLE=/usr/bin/python3.6
        PIP_EXECUTABLE=/usr/bin/pip3.6
        export LD_LIBRARY_PATH=/usr/lib64:${LD_LIBRARY_PATH}
        export PYTHON_FLAGS="-DPYTHON_EXECUTABLE:FILEPATH=/usr/bin/python3.6
        -DPYTHON_INCLUDE_DIR:PATH=/usr/include/python3.6m
        -DPYTHON_LIBRARIES:FILEPATH=/usr/lib64/libpython3.6m.so"
    elif [ "$1" == "mac-cp36-cp36m" ]; then
#       NOTE: The following setting is for building osx package. Please run this on osx
#             The currently is assuming you install python3.6 off the pathon.org
#             Please adjust each variables accordingly.
        PYTHON_EXECUTABLE=/Library/Frameworks/Python.framework/Versions/3.6/bin/python3.6
        PIP_EXECUTABLE=/Library/Frameworks/Python.framework/Versions/3.6/bin/pip
        export LD_LIBRARY_PATH=/Library/Frameworks/Python.framework/Versions/3.6/:${LD_LIBRARY_PATH}
        export PYTHON_FLAGS="-DPYTHON_EXECUTABLE:FILEPATH=/Library/Frameworks/Python.framework/Versions/3.6/bin/python3.6
        -DPYTHON_INCLUDE_DIR:PATH=/Library/Frameworks/Python.framework/Versions/3.6/include/python3.6m
        -DPYTHON_LIBRARIES:FILEPATH=/Library/Frameworks/Python.framework/Versions/3.6/Python"
    fi
else
  echo "Please specify an environment. {cp27-cp27m, cp27-cp27mu, cp34-cp34m, cp35-cp35m, cp36-cp36m, mac-cp36-cp36m}"
  exit
fi

if [ "$PYTHON_EXECUTABLE" == "" ]; then
    echo "Incorrect python environment. "
    echo "Please choose from {cp27-cp27m, cp27-cp27mu, cp34-cp34m, cp35-cp35m, cp36-cp36m, mac-cp36-cp36m}"
    exit
fi

echo $LD_LIBRARY_PATH
echo $PATH
echo $PYTHON_FLAGS

$PIP_EXECUTABLE install wheel
$PIP_EXECUTABLE install -r requirements.txt
$PYTHON_EXECUTABLE setup.py bdist_wheel
