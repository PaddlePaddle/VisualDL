find_package(JlCxx REQUIRED)

add_library(vdljl SHARED vdljl.cc)
add_dependencies(vdljl im entry tablet sdk storage protobuf eigen3)
target_link_libraries(vdljl PRIVATE JlCxx::cxxwrap_julia entry binary_record im tablet storage sdk protobuf ${OPTIONAL_LINK_FLAGS})
