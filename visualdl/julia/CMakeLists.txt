find_package(JlCxx REQUIRED)

add_library(vdljl SHARED vdljl.cc)
add_dependencies(vdljl im entry tablet sdk storage protobuf eigen3)
target_link_libraries(vdljl JlCxx::cxxwrap_julia sdk storage binary_record entry tablet im gtest protobuf pthread eigen3)