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

#include <ctime>

#include "visualdl/logic/im.h"
#include "visualdl/storage/entry.h"
#include "visualdl/storage/storage.h"
#include "visualdl/storage/tablet.h"
#include "visualdl/utils/logging.h"

namespace visualdl {

template <typename T>
void SimpleWriteSyncGuard<T>::Start() {
  CHECK(data_);
  data_->parent()->meta.Inc();
}

template <typename T>
void SimpleWriteSyncGuard<T>::End() {
  CHECK(data_);
  if (data_->parent()->meta.ToSync()) {
    Sync();
  }
}

template <typename T>
void SimpleWriteSyncGuard<T>::Sync() {
  CHECK(data_);
  auto* storage = data_->parent();
  storage->PersistToDisk();
}

template class SimpleWriteSyncGuard<Storage>;
template class SimpleWriteSyncGuard<Tablet>;
template class SimpleWriteSyncGuard<Record>;
template class SimpleWriteSyncGuard<Entry>;

}  // namespace visualdl
