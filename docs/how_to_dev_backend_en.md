# VisualDL Backend / SDK structure and Develop Guide

VisualDL has three components.
1. The Python/C++ SDK that logs the data during training.
1. The single page client side app that visualized training data.
1. The server (powered on Flask) that reads the logs data and delivers it to the client side app for displaying graphs (scalars/histograms) and embeddings.

This doc will go over Backend / SDK structure with development guide.

For front end architecture and development guide, looks [here](./how_to_dev_frontend_en.md)


## Code structure

All backend and sdk logic is under visualdl sub directory

```
├── build
├── build.sh
├── CMakeLists.txt
├── frontend
├── visualdl
    ├── logic    - API for C++ SDK, information maintainer 
    ├── python   - API for Python SDK
    ├── server   - Flask server, provides front end APIs for read data
    ├── storage  - Data structure and protobuf
    └── utils    - Helper function and classes
```

## Development

Any code changes in ```server``` folder, simply run

```
python visualdl/server/visualDL --logdir={LOG_DIR} --port=8080
```
to restart flask server

Notice if you install visualDL from pip install wheel, make sure resetting PYTHONPATH to get the command work.

Any code changes in ```logic```, ```python```, ```storage```, ```utils``` is modified, need to rebuild core.so or sdk to get effect.

Either run VisualDL/build.sh that builds everything or a target like this
```
mkdir {VisualDL_ROOT}/build
cd build
cmake ..
make {TARGET MODULE}
```


## Tests

Modification in SDK API and any major function changes should be adding test cases.


In {VisualDL_ROOT}/CMakeList.txt, we have a list of test files as target

```
add_executable(vl_test
        ${PROJECT_SOURCE_DIR}/visualdl/test.cc
        ${PROJECT_SOURCE_DIR}/visualdl/logic/sdk_test.cc
        ${PROJECT_SOURCE_DIR}/visualdl/logic/histogram_test.cc
        ${PROJECT_SOURCE_DIR}/visualdl/storage/storage_test.cc
        ${PROJECT_SOURCE_DIR}/visualdl/storage/test_binary_record.cc
        ${PROJECT_SOURCE_DIR}/visualdl/utils/test_concurrency.cc
        ${PROJECT_SOURCE_DIR}/visualdl/utils/test_image.cc
        ${PROJECT_SOURCE_DIR}/visualdl/utils/concurrency.h
        ${PROJECT_SOURCE_DIR}/visualdl/utils/filesystem.h
        )
```

Add new test cases in corresponding files where code is modified or create new test files. You can make vl_test target and just run vl_test executable for all test cases.

```
mkdir {VisualDL_ROOT}/build
cd build
cmake ..
make vl_test
./vl_test
```

## Backend / SDK architecture

### Server

- Implement a server using a lightweight framework Flask, provides two services:
  - Host a main application with support of a front end web app 
  - Provide a series of HTTP end points, using JSON for front end data communication
- ```visualDL``` : main app entry point
  - defines server arguments and config
  - provides API and router for front end
- ```lib.py``` : delegate wrapper for function calls
  - read and caches log data
  - convert data to JSON
  - retry mechanism 
- ```graph.py``` and ```onnx```
  - graph.py defines the logic to read and parse onnx model file
  - create edges and nodes as JSON format for front end to read
  - onnx folder contains onnx protobuf interface that ports from onnx repo


### Logic & SDK

#### Python SDK
- ```pybind.cc``` : create python interface from C++ layer
- ```storage.py``` : ```LogReader``` and ```LogWriter``` APIs of Python SDK that maps to pybind

#### C++ SDK
- ```sdk.h```
  - defines ```LogReader``` and ```LogWriter``` APIs of C++ SDK
  - defines feature components such as ```Scalar```, ```Histogram```, ```Image``` and their corresponding component```Reader```
- ```sdk.cc``` : implements ```Reader``` to use ```Storage``` layer for reading and writing

#### Information Container
- Currently it just handles logic of sync cycle (when to write)

#### Storage
- Defines log data format as following:
  - ```Storage``` : main set of data with different modes such as "train" or "test", contain multiple ```Tablet```
  - ```Tablet``` : group a single type of data with ```tag```. One tablet will only represent one data type such as scalar, histogram, image and contains multiple ```Record```. For example one tablet represents a line in scalar chart. 
  - ```Record``` : represent any data structure for any component
- Handles the actual logic to serialized to disk and deserialized from disk
- ```storage.proto```: protobuf file that defines the exact interface to be read/write
