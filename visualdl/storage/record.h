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
  Entry<T> MutableMeta() {
    return Entry<T>(data_->mutable_meta(), parent());
  }

  template <typename T>
  Entry<T> AddData() {
    WRITE_GUARD
    return Entry<T>(data_->add_data(), parent());
  }

  template <typename T>
  Entry<T> MutableData(int i) {
    WRITE_GUARD
    return Entry<T>(data_->mutable_data(i), parent());
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

  template <typename T>
  EntryReader<T> data(int i) {
    return EntryReader<T>(data_.data(i));
  }
  int64_t timestamp() const { return data_.timestamp(); }
  int64_t id() const { return data_.id(); }

  Record::Dtype dtype() const { return (Record::Dtype)data_.dtype(); }

  template <typename T>
  Entry<T> meta() const {
    return data_.meta();
  }

private:
  storage::Record data_;
};

}  // namespace visualdl

#endif
