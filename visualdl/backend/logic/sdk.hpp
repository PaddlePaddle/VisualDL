#include "visualdl/backend/logic/im.h"

namespace visualdl {

/*
 * Utility helper for storage::Entry.
 */
template <typename T> struct Entry {
  // use pointer to avoid copy
  storage::Entry *entry{nullptr};

  Entry(storage::Entry *entry) : entry(entry) {}

  /*
   * Set a single value.
   */
  void Set(T v);

  /*
   * Add a value to repeated message field.
   */
  void Add(T v);
};

template <typename T>
void TabletHelper::AddScalarRecord(int id, T value) {
  auto* record = data_->add_records();
  record->set_id(id);
  Entry<T> entry_helper(record->mutable_data());
  entry_helper.Set(value);
}

} // namespace visualdl
