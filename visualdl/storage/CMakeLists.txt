## add storage_proto as target
protobuf_generate_cpp(PROTO_SRCS PROTO_HDRS storage.proto)
add_library(storage_proto ${PROTO_SRCS})
add_dependencies(storage_proto protobuf)

## add storage as target
add_library(entry entry.cc entry.h ${PROTO_SRCS} ${PROTO_HDRS})
add_library(tablet tablet.cc tablet.h ${PROTO_SRCS} ${PROTO_HDRS})
add_library(record record.cc record.h ${PROTO_SRCS} ${PROTO_HDRS})
add_library(binary_record binary_record.cc binary_record.h ${PROTO_SRCS} ${PROTO_HDRS})
add_library(storage storage.cc storage.h ${PROTO_SRCS} ${PROTO_HDRS})

add_dependencies(entry storage_proto im)
add_dependencies(record storage_proto entry)
add_dependencies(tablet storage_proto)
add_dependencies(storage storage_proto record binary_record tablet entry)

target_link_libraries(storage storage_proto record binary_record tablet entry)
