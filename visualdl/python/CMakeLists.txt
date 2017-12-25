function(py_test TARGET_NAME)
    set(options STATIC static SHARED shared)
    set(oneValueArgs "")
    set(multiValueArgs SRCS DEPS ARGS)
    cmake_parse_arguments(py_test "${options}" "${oneValueArgs}" "${multiValueArgs}" ${ARGN})
    add_test(NAME ${TARGET_NAME}
             COMMAND env PYTHONPATH=${CMAKE_BINARY_DIR}/visualdl/logic
             ${PYTHON_EXECUTABLE} -u ${py_test_SRCS} ${py_test_ARGS}
             WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
             )
endfunction()

py_test(test_summary SRCS test_storage.py)
