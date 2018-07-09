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

add_library(im ${PROJECT_SOURCE_DIR}/visualdl/logic/im.cc)
add_library(sdk ${PROJECT_SOURCE_DIR}/visualdl/logic/sdk.cc ${PROJECT_SOURCE_DIR}/visualdl/utils/image.h)
add_dependencies(im storage_proto)
add_dependencies(sdk entry binary_record storage storage_proto eigen3)

## pybind
set(OPTIONAL_LINK_FLAGS)

if((NOT APPLE) AND (NOT WIN32))
  set(OPTIONAL_LINK_FLAGS "rt")
endif()

add_library(core SHARED ${PROJECT_SOURCE_DIR}/visualdl/logic/pybind.cc)

## do not link python library and let system auto resolve to avoid different python lib conflict

if (NOT ON_RELEASE)
  add_dependencies(core pybind im entry tablet storage sdk protobuf glog eigen3)
  target_link_libraries(core PRIVATE pybind entry binary_record im tablet storage sdk protobuf glog ${OPTIONAL_LINK_FLAGS})
else()
  add_dependencies(core pybind im entry tablet storage sdk protobuf eigen3)
  target_link_libraries(core PRIVATE pybind entry binary_record im tablet storage sdk protobuf ${OPTIONAL_LINK_FLAGS})
endif()

## MacOS needs this flag to import python lib
if (APPLE)
  set_target_properties(core PROPERTIES LINK_FLAGS "-undefined dynamic_lookup")
endif()

if (MSVC)
  set_target_properties(core PROPERTIES PREFIX "" SUFFIX ".pyd")
  add_custom_command(TARGET core POST_BUILD
    COMMAND "${CMAKE_COMMAND}" -E copy
      "${CMAKE_CURRENT_BINARY_DIR}/${CMAKE_BUILD_TYPE}/core.pyd"
      "${VISUALDL_SOURCE_DIR}/visualdl/python/"
    COMMAND "${CMAKE_COMMAND}" -E copy
      "${CMAKE_CURRENT_BINARY_DIR}/${CMAKE_BUILD_TYPE}/core.pyd"
      "${VISUALDL_SOURCE_DIR}/visualdl/"
    COMMAND "${CMAKE_COMMAND}" -E copy
      "${THIRD_PARTY_PATH}/install/protobuf/bin/libprotobuf.dll"
      "${VISUALDL_SOURCE_DIR}/visualdl/python/"
    COMMAND "${CMAKE_COMMAND}" -E copy
      "${THIRD_PARTY_PATH}/install/protobuf/bin/libprotobuf.dll"
      "${VISUALDL_SOURCE_DIR}/visualdl/"
    COMMENT "Copying core.pyd and libprotobuf.dll to ${VISUALDL_SOURCE_DIR}/visualdl/python/")
else()
  set_target_properties(core PROPERTIES PREFIX "" SUFFIX ".so")
  add_custom_command(TARGET core POST_BUILD
    COMMAND "${CMAKE_COMMAND}" -E copy
      "${CMAKE_CURRENT_BINARY_DIR}/core.so"
      "${VISUALDL_SOURCE_DIR}/visualdl/python/"
    COMMAND "${CMAKE_COMMAND}" -E copy
      "${CMAKE_CURRENT_BINARY_DIR}/core.so"
      "${VISUALDL_SOURCE_DIR}/visualdl/"
    COMMENT "Copying core.so to ${VISUALDL_SOURCE_DIR}/visualdl/python/")
endif()
