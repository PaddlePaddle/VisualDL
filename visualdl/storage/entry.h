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
  DECL_GUARD(Entry)
  // use pointer to avoid copy
  storage::Entry* entry{nullptr};

  Entry() {}
  explicit Entry(storage::Entry* entry, void* parent)
      : entry(entry), x_(parent) {}
  void operator()(storage::Entry* entry, void* parent) {
    this->entry = entry;
    x_ = parent;
  }

  // Set a single value.
  void Set(T v);

  // Add a value to repeated message field.
  void Add(T v);

  Storage* parent() { return x_; }

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
