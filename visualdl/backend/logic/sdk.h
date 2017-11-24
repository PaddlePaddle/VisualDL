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
  void SetDir(const std::string &dir) { data_->set_dir(dir); }

  int64_t timestamp() const { return data_->timestamp(); }
  std::string dir() const { return data_->dir(); }
  int tablets_size() const { return data_->tablets_size(); }
  std::string buffer() const { return data_->SerializeAsString(); }
  std::string human_readable_buffer() const;

private:
  storage::Storage *data_;
};

class ImHelper {
public:
  ImHelper() {}

  StorageHelper storage() {
    return StorageHelper(
        InformationMaintainer::Global().storage().mutable_data());
  }
  TabletHelper tablet(const std::string &tag) {
    return TabletHelper(InformationMaintainer::Global().storage().tablet(tag));
  }
  TabletHelper AddTablet(const std::string &tag, int num_samples) {
    return TabletHelper(
        InformationMaintainer::Global().AddTablet(tag, num_samples));
  }
  void ClearTablets() {
    InformationMaintainer::Global().storage().mutable_data()->clear_tablets();
  }

  void PersistToDisk() const;
};

namespace components {

/*
 * Read and write support for Scalar component.
 */
template <typename T>
class ScalarHelper {
public:
  ScalarHelper(storage::Tablet *tablet) : data_(tablet) {}

  void SetCaptions(const std::vector<std::string> &captions);

  void AddRecord(int id, const std::vector<T> &values);

  std::vector<std::vector<T>> GetRecords() const;

  std::vector<int> GetIds() const;

  std::vector<int> GetTimestamps() const;

  std::vector<std::string> GetCaptions() const;

  size_t GetSize() const { return data_->records_size(); }

private:
  storage::Tablet *data_;
};

}  // namespace components

static ImHelper &get_im() {
  static ImHelper im;
  return im;
}

}  // namespace visualdl

#endif  // VISUALDL_BACKEND_LOGIC_SDK_H
