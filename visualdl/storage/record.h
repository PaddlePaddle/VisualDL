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

#ifndef VISUALDL_STORAGE_RECORD_H
#define VISUALDL_STORAGE_RECORD_H

#include "visualdl/logic/im.h"
#include "visualdl/storage/entry.h"
#include "visualdl/storage/storage.pb.h"

namespace visualdl {

/*
 * A helper for operations on storage::Record
 */
struct Record {
  enum Dtype {
    kInt32 = 0,
    kInt64 = 1,
    kFloat = 2,
    kDouble = 3,
    kString = 4,
    kBool = 5,
    // entrys
    kInt64s = 6,
    kFloats = 7,
    kDoubles = 8,
    kStrings = 9,
    kInt32s = 10,
    kBools = 11,
    kUnknown = 12
  };

  DECL_GUARD(Record)

  Record() {}
  Record(storage::Record* x, Storage* parent) : data_(x), x_(parent) {}
  Record(const Record& other) : data_(other.data_), x_(other.x_) {}

  // write operations
  void SetTimeStamp(int64_t x) {
    data_->set_timestamp(x);
    WRITE_GUARD
  }

  void SetId(int64_t id) {
    data_->set_id(id);
    WRITE_GUARD
  }

  void SetDtype(Dtype type) {
    data_->set_dtype(storage::DataType(type));
    WRITE_GUARD
  }

  template <typename T>
  Entry MutableMeta() {
    return Entry(data_->mutable_meta(), parent());
  }

  Entry AddData() {
    WRITE_GUARD
    return Entry(data_->add_data(), parent());
  }

  template <typename T>
  Entry MutableData(int i) {
    WRITE_GUARD
    return Entry(data_->mutable_data(i), parent());
  }

  Storage* parent() { return x_; }

private:
  storage::Record* data_{nullptr};
  Storage* x_;
};

struct RecordReader {
  RecordReader(storage::Record x) : data_(x) {}

  // read operations
  size_t data_size() const { return data_.data_size(); }

  EntryReader data(int i) { return EntryReader(data_.data(i)); }
  int64_t timestamp() const { return data_.timestamp(); }
  int64_t id() const { return data_.id(); }

  Record::Dtype dtype() const { return (Record::Dtype)data_.dtype(); }

  EntryReader meta() const { return data_.meta(); }

private:
  storage::Record data_;
};

}  // namespace visualdl

#endif
