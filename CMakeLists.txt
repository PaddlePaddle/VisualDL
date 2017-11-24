cmake_minimum_required(VERSION 3.5)
project(VisualDL)

set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} "${CMAKE_CURRENT_SOURCE_DIR}/cmake")
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_FLAGS "-fPIC")


set(THIRD_PARTY_PATH "${CMAKE_BINARY_DIR}/third_party" CACHE STRING
        "A path setting third party libraries download & build directories.")

################################ Configurations #######################################
option(WITH_TESTING     "Compile VisualDL with unit testing"        ON)


include(external/zlib)      # download, build, install zlib
include(external/gflags)    # download, build, install gflags
include(external/glog)      # download, build, install glog
include(external/gtest)     # download, build, install gtest
include(external/pybind11)  # download pybind11
include(external/protobuf)  # download, build, install protobuf
include(external/python)    # find python and set path

include_directories(${PROJECT_SOURCE_DIR})
include_directories(${CMAKE_CURRENT_BINARY_DIR})
include_directories(${PROJECT_SOURCE_DIR}/thirdparty/local/include)

add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/visualdl/backend/storage)
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/visualdl/backend/logic)

add_executable(vl_test
        ${PROJECT_SOURCE_DIR}/visualdl/backend/test.cc
        ${PROJECT_SOURCE_DIR}/visualdl/backend/logic/im_test.cc)
target_link_libraries(vl_test storage im gtest glog protobuf gflags)
