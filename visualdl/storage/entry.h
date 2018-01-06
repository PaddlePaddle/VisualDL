#ifndef VISUALDL_STORAGE_ENTRY_H
#define VISUALDL_STORAGE_ENTRY_H

#include "visualdl/logic/im.h"
#include "visualdl/storage/storage.pb.h"
#include "visualdl/utils/guard.h"

namespace visualdl {

struct Storage;

using byte_t = unsigned char;

/*
 * Utility helper for storage::Entry.
 */
struct Entry {
  DECL_GUARD(Entry)
  // use pointer to avoid copy
  storage::Entry* entry{nullptr};

  Entry() {}
  Entry(storage::Entry* entry, Storage* parent) : entry(entry), x_(parent) {}
  Entry(const Entry& other) : entry(other.entry), x_(other.x_) {}

  void operator()(storage::Entry* entry, Storage* parent) {
    this->entry = entry;
    x_ = parent;
  }

  // Set a single value.
  template <typename T>
  void Set(T v);

  void SetRaw(const std::string& bytes) { entry->set_y(bytes); }

  // Add a value to repeated message field.
  template <typename T>
  void Add(T v);

  template <typename T>
  void SetMulti(const std::vector<T>& v);

  Storage* parent() { return x_; }
  void set_parent(Storage* x) { x_ = x; }

private:
  Storage* x_;
};

struct EntryReader {
  EntryReader(storage::Entry x) : data_(x) {}
  // Get a single value.
  template <typename T>
  T Get() const;
  // Get repeated field.
  template <typename T>
  std::vector<T> GetMulti() const;

  std::string GetRaw() { return data_.y(); }

private:
  storage::Entry data_;
};

}  // namespace visualdl

#endif
