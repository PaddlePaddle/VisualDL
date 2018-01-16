add_library(im ${PROJECT_SOURCE_DIR}/visualdl/logic/im.cc)
add_library(sdk ${PROJECT_SOURCE_DIR}/visualdl/logic/sdk.cc ${PROJECT_SOURCE_DIR}/visualdl/utils/image.h)
add_dependencies(im storage_proto)
add_dependencies(sdk entry storage storage_proto eigen3)

## pybind
set(OPTIONAL_LINK_FLAGS)

if(NOT APPLE)
  set(OPTIONAL_LINK_FLAGS "rt")
endif()

add_library(core SHARED ${PROJECT_SOURCE_DIR}/visualdl/logic/pybind.cc)

if (NOT ON_RELEASE)
  add_dependencies(core pybind python im entry tablet storage sdk protobuf glog eigen3)
  target_link_libraries(core PRIVATE pybind entry python im tablet storage sdk protobuf glog ${OPTIONAL_LINK_FLAGS})
else()
  add_dependencies(core pybind python im entry tablet storage sdk protobuf eigen3)
  target_link_libraries(core PRIVATE pybind entry python im tablet storage sdk protobuf ${OPTIONAL_LINK_FLAGS})
endif()
set_target_properties(core PROPERTIES PREFIX "" SUFFIX ".so")
