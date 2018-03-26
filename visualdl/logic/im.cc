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

const long minimun_sync_cycle = 100;
// Expect sync happens every 15~25 seconds
const int sync_period = 20;
const int period_range = 5;
const double slower_multiplier = 1.4;
const double faster_multiplier = 0.5;

static time_t last_sync_time = time(NULL);

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

    time_t current_time = time(NULL);
    time_t interval = current_time - last_sync_time;

    // If last sync happens more than 25 seconds ago, the system needs to make
    // the sync-up faster
    if (interval > sync_period + period_range) {
      data_->parent()->meta.cycle =
          std::max(long(data_->parent()->meta.cycle * faster_multiplier),
                   minimun_sync_cycle);
    } else if (interval < sync_period - period_range) {
      // If the last sync happens less than 15 seconds ago, the system needs to
      // make the sync-up slower.
      data_->parent()->meta.cycle = std::min(
          std::max(long(data_->parent()->meta.cycle * slower_multiplier),
                   minimun_sync_cycle),
          LONG_MAX);
    }
    last_sync_time = current_time;
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
