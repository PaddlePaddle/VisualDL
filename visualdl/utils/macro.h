/* Copyright (c) 2017 VisualDL Authors. All Rights Reserve.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

#ifndef VISUALDL_UTILS_MACRO_H
#define VISUALDL_UTILS_MACRO_H

#define DECL_BASIC_TYPES_CLASS_IMPL(class__, name__) \
  template class__ name__<int32_t>;                  \
  template class__ name__<int64_t>;                  \
  template class__ name__<float>;                    \
  template class__ name__<double>;

#endif
