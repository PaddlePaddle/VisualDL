cmake_minimum_required(VERSION 3.5)
project(VisualDL)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_FLAGS "-fPIC")

include_directories(${CMAKE_CURRENT_SOURCE_DIR})
include_directories(${PROJECT_SOURCE_DIR}/thirdparty/local/include)
include_directories(/usr/include/python2.7)

set(PYBIND11_CPP_STANDARD -std=c++11)
add_subdirectory(${PROJECT_SOURCE_DIR}/thirdparty/pybind11-2.2.1)

link_directories(${PROJECT_SOURCE_DIR}/thirdparty/local/lib)

add_library(storage
        ${PROJECT_SOURCE_DIR}/visualdl/backend/storage/storage.cc
        ${PROJECT_SOURCE_DIR}/visualdl/backend/storage/storage.pb.cc)
add_library(sdk ${PROJECT_SOURCE_DIR}/visualdl/backend/logic/sdk.cc)
add_library(im ${PROJECT_SOURCE_DIR}/visualdl/backend/logic/im.cc)

pybind11_add_module(core
        ${PROJECT_SOURCE_DIR}/visualdl/backend/logic/pybind.cc)
target_link_libraries(core PRIVATE pybind11::module im storage sdk protobuf glog)
set_target_properties(core PROPERTIES POSITION_INDEPENDENT_CODE TRUE)

add_executable(vl_test
        ${PROJECT_SOURCE_DIR}/visualdl/backend/test.cc
        ${PROJECT_SOURCE_DIR}/visualdl/backend/logic/im_test.cc)
target_link_libraries(vl_test storage im gtest glog protobuf gflags)
