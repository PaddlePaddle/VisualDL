#ifndef VISUALDL_BACKEND_LOGIC_SDK_H
#define VISUALDL_BACKEND_LOGIC_SDK_H

#include <glog/logging.h>
#include <time.h>
#include <map>

#include "visualdl/backend/logic/im.h"

namespace visualdl {

/*
 * Utility helper for storage::Entry.
 */
template <typename T>
struct EntryHelper {
  // use pointer to avoid copy
  storage::Entry *entry{nullptr};

  EntryHelper() {}
  explicit EntryHelper(storage::Entry *entry) : entry(entry) {}
  void operator()(storage::Entry *entry) { this->entry = entry; }

  /*
   * Set a single value.
   */
  void Set(T v);

  /*
   * Add a value to repeated message field.
   */
  void Add(T v);

  /*
   * Get a single value.
   */
  T Get() const;

  /*
   * Get repeated field.
   */
  std::vector<T> GetMulti() const;
};

class TabletHelper {
public:
  // basic member getter and setter
  std::string record_buffer(int idx) const {
    return data_->records(idx).SerializeAsString();
  }
  size_t records_size() const { return data_->records_size(); }
  std::string buffer() const { return data_->SerializeAsString(); }
  std::string human_readable_buffer() const;
  void SetBuffer(const storage::Tablet &t) { *data_ = t; }
  void SetBuffer(const std::string &b) { data_->ParseFromString(b); }
  storage::Tablet &data() const { return *data_; }

  // constructor that enable concurrency.
  TabletHelper(storage::Tablet *t) : data_(t) {}
  // data updater that resuage of one instance.
  TabletHelper &operator()(storage::Tablet *t) {
    data_ = t;
    return *this;
  }

private:
  storage::Tablet *data_;
};

class StorageHelper {
public:
  StorageHelper(storage::Storage *s) : data_(s) {}
  StorageHelper &operator()(storage::Storage *s) {
    data_ = s;
    return *this;
  }

  void SetBuffer(const storage::Storage &buffer) { *data_ = buffer; }
  void SetBuffer(const std::string &buffer) { data_->ParseFromString(buffer); }
  void SetDir(const std::string &dir) {
    CHECK(data_) << "no storage instance hold";
    data_->set_dir(dir);
  }

  int64_t timestamp() const { return data_->timestamp(); }
  std::string dir() const { return data_->dir(); }
  int tablets_size() const { return data_->tablets_size(); }
  std::string buffer() const { return data_->SerializeAsString(); }
  std::string human_readable_buffer() const;

private:
  storage::Storage *data_{nullptr};
};

class ImHelper {
public:
  ImHelper() {}

  /*
   * mode:
   * 0: read
   * 1: write
   * 2: none
   */
}

}  // namespace visualdl

#endif  // VISUALDL_BACKEND_LOGIC_SDK_H
