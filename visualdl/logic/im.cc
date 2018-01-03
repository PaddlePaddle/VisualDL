#include <glog/logging.h>
#include <ctime>

#include "visualdl/logic/im.h"
#include "visualdl/storage/entry.h"
#include "visualdl/storage/storage.h"
#include "visualdl/storage/tablet.h"

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
template class SimpleWriteSyncGuard<Entry<float>>;
template class SimpleWriteSyncGuard<Entry<double>>;
template class SimpleWriteSyncGuard<Entry<bool>>;
template class SimpleWriteSyncGuard<Entry<long>>;
template class SimpleWriteSyncGuard<Entry<long long>>;
template class SimpleWriteSyncGuard<Entry<std::string>>;
template class SimpleWriteSyncGuard<Entry<std::vector<byte_t>>>;
template class SimpleWriteSyncGuard<Entry<int>>;

}  // namespace visualdl
