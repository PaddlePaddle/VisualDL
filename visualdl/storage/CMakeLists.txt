# A modified version of protobuf_generate_cpp, that does not use protobuf::protoc,
# which are not supported on Windows.
function(visualdl_protobuf_generate_cpp SRCS HDRS)
  cmake_parse_arguments(protobuf "" "EXPORT_MACRO;DESCRIPTORS" "" ${ARGN})
  set(PROTO_FILES "${protobuf_UNPARSED_ARGUMENTS}")
  if(NOT PROTO_FILES)
    message(SEND_ERROR "Error: PROTOBUF_GENERATE_CPP() called without any proto files")
    return()
  endif()

  if(protobuf_EXPORT_MACRO)
    set(DLL_EXPORT_DECL "dllexport_decl=${protobuf_EXPORT_MACRO}:")
  endif()

  if(PROTOBUF_GENERATE_CPP_APPEND_PATH)
    # Create an include path for each file specified
    foreach(FIL ${PROTO_FILES})
      get_filename_component(ABS_FIL ${FIL} ABSOLUTE)
      get_filename_component(ABS_PATH ${ABS_FIL} PATH)
      list(FIND _protobuf_include_path ${ABS_PATH} _contains_already)
      if(${_contains_already} EQUAL -1)
          list(APPEND _protobuf_include_path -I ${ABS_PATH})
      endif()
    endforeach()
  else()
    set(_protobuf_include_path -I ${CMAKE_CURRENT_SOURCE_DIR})
  endif()

  if(DEFINED PROTOBUF_IMPORT_DIRS AND NOT DEFINED Protobuf_IMPORT_DIRS)
    set(Protobuf_IMPORT_DIRS "${PROTOBUF_IMPORT_DIRS}")
  endif()

  if(DEFINED Protobuf_IMPORT_DIRS)
    foreach(DIR ${Protobuf_IMPORT_DIRS})
      get_filename_component(ABS_PATH ${DIR} ABSOLUTE)
      list(FIND _protobuf_include_path ${ABS_PATH} _contains_already)
      if(${_contains_already} EQUAL -1)
          list(APPEND _protobuf_include_path -I ${ABS_PATH})
      endif()
    endforeach()
  endif()

  set(${SRCS})
  set(${HDRS})
  if (protobuf_DESCRIPTORS)
    set(${protobuf_DESCRIPTORS})
  endif()

  foreach(FIL ${PROTO_FILES})
    get_filename_component(ABS_FIL ${FIL} ABSOLUTE)
    get_filename_component(FIL_WE ${FIL} NAME_WE)
    if(NOT PROTOBUF_GENERATE_CPP_APPEND_PATH)
      get_filename_component(FIL_DIR ${FIL} DIRECTORY)
      if(FIL_DIR)
        set(FIL_WE "${FIL_DIR}/${FIL_WE}")
      endif()
    endif()

    set(_protobuf_protoc_src "${CMAKE_CURRENT_BINARY_DIR}/${FIL_WE}.pb.cc")
    set(_protobuf_protoc_hdr "${CMAKE_CURRENT_BINARY_DIR}/${FIL_WE}.pb.h")
    list(APPEND ${SRCS} "${_protobuf_protoc_src}")
    list(APPEND ${HDRS} "${_protobuf_protoc_hdr}")

    if(protobuf_DESCRIPTORS)
      set(_protobuf_protoc_desc "${CMAKE_CURRENT_BINARY_DIR}/${FIL_WE}.desc")
      set(_protobuf_protoc_flags "--descriptor_set_out=${_protobuf_protoc_desc}")
      list(APPEND ${protobuf_DESCRIPTORS} "${_protobuf_protoc_desc}")
    else()
      set(_protobuf_protoc_desc "")
      set(_protobuf_protoc_flags "")
    endif()

    add_custom_command(
      OUTPUT "${_protobuf_protoc_src}"
             "${_protobuf_protoc_hdr}"
             ${_protobuf_protoc_desc}
      COMMAND ${PROTOBUF_PROTOC_EXECUTABLE}
               "--cpp_out=${DLL_EXPORT_DECL}${CMAKE_CURRENT_BINARY_DIR}"
               ${_protobuf_protoc_flags}
               ${_protobuf_include_path} ${ABS_FIL}
      DEPENDS ${ABS_FIL} protobuf
      COMMENT "Running C++ protocol buffer compiler on ${FIL}"
      VERBATIM )
  endforeach()

  set(${SRCS} "${${SRCS}}" PARENT_SCOPE)
  set(${HDRS} "${${HDRS}}" PARENT_SCOPE)
  if(protobuf_DESCRIPTORS)
    set(${protobuf_DESCRIPTORS} "${${protobuf_DESCRIPTORS}}" PARENT_SCOPE)
  endif()
endfunction()

## add storage_proto as target
visualdl_protobuf_generate_cpp(PROTO_SRCS PROTO_HDRS storage.proto)
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
