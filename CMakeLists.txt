cmake_minimum_required(VERSION 3.2)
project(VisualDL)

find_program(CCACHE_FOUND ccache)
if(CCACHE_FOUND)
  set_property(GLOBAL PROPERTY RULE_LAUNCH_COMPILE ccache)
  set_property(GLOBAL PROPERTY RULE_LAUNCH_LINK ccache)
endif(CCACHE_FOUND)

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
include(external/eigen)     # download eigen
include(external/pybind11)  # download pybind11
include(external/protobuf)  # download, build, install protobuf
include(external/python)    # find python and set path

include_directories(${PROJECT_SOURCE_DIR})
include_directories(${CMAKE_CURRENT_BINARY_DIR})
# TODO(ChunweiYan) debug, remote latter
#include_directories(/home/superjom/project/VisualDL/build/third_party/eigen3/src/extern_eigen3)

add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/visualdl/storage)
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/visualdl/logic)
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/visualdl/python)

add_executable(vl_test
        ${PROJECT_SOURCE_DIR}/visualdl/test.cc
        ${PROJECT_SOURCE_DIR}/visualdl/logic/sdk_test.cc
        ${PROJECT_SOURCE_DIR}/visualdl/storage/storage_test.cc
        ${PROJECT_SOURCE_DIR}/visualdl/utils/test_concurrency.cc
        ${PROJECT_SOURCE_DIR}/visualdl/utils/test_image.cc
        ${PROJECT_SOURCE_DIR}/visualdl/utils/concurrency.h
        ${PROJECT_SOURCE_DIR}/visualdl/utils/filesystem.h
        )
target_link_libraries(vl_test sdk storage entry tablet im gtest glog protobuf gflags pthread eigen3)

enable_testing ()

add_custom_target(test_init COMMAND $CMAKE_BINARY_DIR)
add_test(NAME vstest COMMAND ./vl_test)
