# Copyright (c) 2017 VisualDL Authors. All Rights Reserve.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License

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
set(VISUALDL_SOURCE_DIR ${CMAKE_CURRENT_SOURCE_DIR})

set(THIRD_PARTY_PATH "${CMAKE_BINARY_DIR}/third_party" CACHE STRING
        "A path setting third party libraries download & build directories.")

################################ Configurations #######################################
option(WITH_DOC         "Compile VisualDL with documentation"       OFF)
option(WITH_TESTING     "Compile VisualDL with unit testing"        ON)
option(WITH_PYTHON3     "Compile VisualDL with Python 3"            OFF)
option(ON_RELEASE       "RELEASE mode" ON)


include(external/zlib)      # download, build, install zlib
if (NOT ON_RELEASE)
  include(external/gflags)    # download, build, install gflags
  include(external/glog)      # download, build, install glog
endif(NOT ON_RELEASE)
include(external/gtest)     # download, build, install gtest
include(external/eigen)     # download eigen
include(external/pybind11)  # download pybind11
include(external/protobuf)  # download, build, install protobuf
include(external/python)    # find python and set path


if (NOT ON_RELEASE)
  message(STATUS "build on debug mode")
  add_definitions(-DVISUALDL_WITH_GLOG)
endif(NOT ON_RELEASE)

include_directories(${PROJECT_SOURCE_DIR})
include_directories(${CMAKE_CURRENT_BINARY_DIR})

add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/visualdl/storage)
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/visualdl/logic)
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/visualdl/python)

# compile test only in release mode
if (NOT ON_RELEASE)
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
target_link_libraries(vl_test sdk storage binary_record entry tablet im gtest glog protobuf gflags pthread eigen3)
enable_testing ()
add_test(NAME vstest COMMAND ./vl_test)
endif(NOT ON_RELEASE)

if(WITH_DOC)
    add_subdirectory(docs)
endif()
