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
# limitations under the License.

INCLUDE(python_module)

IF(WITH_PYTHON3)
    FIND_PACKAGE(PythonInterp 3)
    FIND_PACKAGE(PythonLibs 3)
ELSE()
    FIND_PACKAGE(PythonInterp 2.7)
    FIND_PACKAGE(PythonLibs 2.7)
ENDIF(WITH_PYTHON3)

# Fixme: Maybe find a static library. Get SHARED/STATIC by FIND_PACKAGE.
ADD_LIBRARY(python SHARED IMPORTED GLOBAL)
SET_PROPERTY(TARGET python PROPERTY IMPORTED_LOCATION ${PYTHON_LIBRARIES})

SET(py_env "")
IF(PYTHONINTERP_FOUND)
    find_python_module(pip REQUIRED)
    find_python_module(numpy REQUIRED)
    find_python_module(wheel REQUIRED)
ENDIF(PYTHONINTERP_FOUND)

INCLUDE_DIRECTORIES(${PYTHON_INCLUDE_DIR})
INCLUDE_DIRECTORIES(${PYTHON_NUMPY_INCLUDE_DIR})
