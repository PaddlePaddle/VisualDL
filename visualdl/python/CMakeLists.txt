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
py_test(test_cache SRCS cache.py)
