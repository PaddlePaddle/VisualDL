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

#ifndef VISUALDL_LOGIC_IM_H
#define VISUALDL_LOGIC_IM_H

#include <memory>
#include <mutex>
#include <string>

#include "visualdl/utils/concurrency.h"
#include "visualdl/utils/guard.h"
#include "visualdl/utils/logging.h"

namespace visualdl {

/*
 * Simple logic to sync memory to disk.
 */
template <typename T>
class SimpleWriteSyncGuard {
public:
  SimpleWriteSyncGuard(T* x) : data_(x) { Start(); }
  ~SimpleWriteSyncGuard() { End(); }

  void Start();
  void End();
  void Sync();

private:
  T* data_{nullptr};
};

}  // namespace visualdl

#endif  // VISUALDL_BACKEND_LOGIC_IM_H
