## add storage_proto as target
protobuf_generate_cpp(PROTO_SRCS PROTO_HDRS storage.proto)
add_library(storage_proto ${PROTO_SRCS})
add_dependencies(storage_proto protobuf)

## add storage as target
add_library(storage storage.cc ${PROTO_SRCS} ${PROTO_HDRS})
add_dependencies(storage storage_proto)
