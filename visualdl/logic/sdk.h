#ifndef VISUALDL_LOGIC_SDK_H
#define VISUALDL_LOGIC_SDK_H

#include <glog/logging.h>
#include <time.h>
#include <map>

#include "visualdl/logic/im.h"

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
  // TODO(ChunweiYan) decouple helper with resource.
  ImHelper() { im_.reset(new IM); }
  ImHelper(std::unique_ptr<IM> im) : im_(std::move(im)) {}

  StorageHelper storage() {
    return StorageHelper(im_->storage().mutable_data());
  }
  TabletHelper tablet(const std::string &tag) {
    return TabletHelper(im_->storage().tablet(tag));
  }
  TabletHelper AddTablet(const std::string &tag, int num_samples) {
    return TabletHelper(im_->AddTablet(tag, num_samples));
  }
  std::mutex &handler() { return im_->handler(); }
  void ClearTablets() { im_->storage().mutable_data()->clear_tablets(); }
  void StartReadService(const std::string &dir, int msecs) {
    im_->SetPersistDest(dir);
    im_->MaintainRead(dir, msecs);
  }
  void StartWriteSerice(const std::string &dir, int msecs) {
    im_->SetPersistDest(dir);
    im_->MaintainWrite(dir, msecs);
  }
  void StopService() { im_->executor().Quit(); }
  void PersistToDisk() const { im_->PersistToDisk(); }

private:
  std::unique_ptr<IM> im_;
};

namespace components {

#define ACQUIRE_HANDLER(handler) std::lock_guard<std::mutex> ____(*handler);

/*
 * Read and write support for Scalar component.
 */
template <typename T>
class ScalarHelper {
public:
  ScalarHelper(storage::Tablet *tablet, std::mutex *handler = nullptr)
      : data_(tablet), handler_(handler) {}
  ScalarHelper(TabletHelper &tablet, std::mutex *handler = nullptr)
      : data_(&tablet.data()), handler_(handler) {}

  void SetCaptions(const std::vector<std::string> &captions);

  void AddRecord(int id, const std::vector<T> &values);

  std::vector<std::vector<T>> GetRecords() const;

  std::vector<int> GetIds() const;

  std::vector<int> GetTimestamps() const;

  std::vector<std::string> GetCaptions() const;

  size_t GetSize() const { return data_->records_size(); }

private:
  storage::Tablet *data_;
  std::mutex *handler_;
};

}  // namespace components
}  // namespace visualdl

#endif  // VISUALDL_BACKEND_LOGIC_SDK_H
