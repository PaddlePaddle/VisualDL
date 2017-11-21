#ifndef VISUALDL_BACKEND_LOGIC_SDK_H
#define VISUALDL_BACKEND_LOGIC_SDK_H
#include "visualdl/backend/logic/im.h"

#include <map>

namespace visualdl {

class TabletHelper {
public:
  // method for each components
  template <typename T>
  void AddScalarRecord(int id, T value);

  // basic member getter and setter
  std::string record_buffer(int idx) const { return data_->records(idx).SerializeAsString(); }
  size_t records_size() const { return data_->records_size(); }
  std::string buffer() const { return data_->SerializeAsString(); }
  std::string human_readable_buffer() const;
  void SetBuffer(const storage::Tablet &t) { *data_ = t; }
  void SetBuffer(const std::string &b) { data_->ParseFromString(b); }

  // constructor that enable concurrency.
  TabletHelper(storage::Tablet *t) : data_(t) {}
  // data updater that resuage of one instance.
  TabletHelper &operator()(storage::Tablet *t) { data_ = t; return *this; }

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
    return TabletHelper(InformationMaintainer::Global().storage().Find(tag));
  }
  TabletHelper AddTablet(const std::string &tag, int num_samples) {
    return TabletHelper(
        InformationMaintainer::Global().AddTablet(tag, num_samples));
  }
};

static ImHelper& get_im() {
  static ImHelper im;
  return im;
}

} // namespace visualdl

#include "visualdl/backend/logic/sdk.hpp"
#endif  // VISUALDL_BACKEND_LOGIC_SDK_H
