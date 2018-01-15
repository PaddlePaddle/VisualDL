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

#ifndef VISUALDL_STORAGE_ENTRY_H
#define VISUALDL_STORAGE_ENTRY_H

#include "visualdl/logic/im.h"
#include "visualdl/storage/storage.pb.h"
#include "visualdl/utils/guard.h"

namespace visualdl {

struct Storage;

using byte_t = unsigned char;

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

  // TODO(ChunweiYan) avoid copy.
  EntryReader reader() { return EntryReader(*entry); }

private:
  Storage* x_;
};

}  // namespace visualdl

#endif
