#ifndef VISUALDL_STORAGE_ENTRY_H
#define VISUALDL_STORAGE_ENTRY_H

#include "visualdl/logic/im.h"
#include "visualdl/storage/storage.pb.h"
#include "visualdl/utils/guard.h"

namespace visualdl {

struct Storage;

/*
 * Utility helper for storage::Entry.
 */
template <typename T>
struct Entry {
  DECL_GUARD(Entry<T>)
  // use pointer to avoid copy
  storage::Entry* entry{nullptr};

  Entry() {}
  Entry(storage::Entry* entry, Storage* parent) : entry(entry), x_(parent) {}
  Entry(const Entry<T>& other) : entry(other.entry), x_(other.x_) {}

  void operator()(storage::Entry* entry, Storage* parent) {
    this->entry = entry;
    x_ = parent;
  }

  // Set a single value.
  void Set(T v);

  // Add a value to repeated message field.
  void Add(T v);

  void SetMulti(const std::vector<T>& v);

  Storage* parent() { return x_; }
  void set_parent(Storage* x) { x_ = x; }

private:
  Storage* x_;
};

template <typename T>
struct EntryReader {
  EntryReader(storage::Entry x) : data_(x) {}
  // Get a single value.
  T Get() const;
  // Get repeated field.
  std::vector<T> GetMulti() const;

private:
  storage::Entry data_;
};

}  // namespace visualdl

#endif
