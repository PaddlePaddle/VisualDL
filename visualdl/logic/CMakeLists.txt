add_library(sdk ${PROJECT_SOURCE_DIR}/visualdl/logic/sdk.cc)
add_library(im ${PROJECT_SOURCE_DIR}/visualdl/logic/im.cc)

## pybind
add_library(core SHARED ${PROJECT_SOURCE_DIR}/visualdl/logic/pybind.cc)
add_dependencies(core pybind python im storage sdk protobuf glog)
target_link_libraries(core PRIVATE pybind python im storage sdk protobuf glog)
