cmake_minimum_required(VERSION 3.8)
project(VisualDL)

set(CMAKE_CXX_STANDARD 11)

include_directories(${CMAKE_CURRENT_SOURCE_DIR})
include_directories(thirdparty/local/include)
link_directories(thirdparty/local/lib)
add_subdirectory(thirdparty/pybind11-2.2.1)

set(SOURCE_FILES
        visualdl/backend/storage/storage.cc visualdl/backend/storage/storage.h
        visualdl/backend/storage/storage.pb.h
        visualdl/backend/storage/storage.pb.cc
        )

add_library(storage visualdl/backend/storage/storage.cc
            visualdl/backend/storage/storage.pb.cc)
add_executable(VisualDL ${SOURCE_FILES})