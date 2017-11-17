cmake_minimum_required(VERSION 3.8)
project(VisualDL)

set(CMAKE_CXX_STANDARD 11)

include_directories(${CMAKE_CURRENT_SOURCE_DIR})
include_directories(thirdparty/local/include)
add_subdirectory(thirdparty/pybind11-2.2.1)

link_directories(thirdparty/local/lib)

set(SOURCE_FILES
        visualdl/backend/storage/storage.cc visualdl/backend/storage/storage.h
        visualdl/backend/storage/storage.pb.h
        visualdl/backend/storage/storage.pb.cc
        )

add_library(storage visualdl/backend/storage/storage.cc
            visualdl/backend/storage/storage.pb.cc)
add_library(c_api visualdl/backend/logic/c_api.cc)
add_library(sdk visualdl/backend/logic/sdk.cc)
add_library(im visualdl/backend/logic/im.cc)

add_executable(vl_test
        visualdl/backend/test.cc
        visualdl/backend/logic/im_test.cc)
target_link_libraries(vl_test storage im gtest glog protobuf gflags)
add_executable(VisualDL ${SOURCE_FILES})

