#ifndef VISUALDL_LOGIC_IM_H
#define VISUALDL_LOGIC_IM_H

#include <glog/logging.h>
#include <memory>
#include <string>

#include "visualdl/storage/storage.h"
#include "visualdl/utils/concurrency.h"

namespace visualdl {

/*
 * IM(Information Maintainer) maintain the Storage singleton in memory,
 * pre-compute some the statistical information to help visualizaton.
 *
 * There should be two processes and each have an IM, one is the web server
 * which hold one IM to read the storage, the other is the SDK(python or C++),
 * it will get an IM to write latest changes to storage.
 *
 * An IM have an underlying Storage object, which might be a memory based
 * storage or a disk based one, both has the same interfaces those defined by
 * class StorageBase.
 *
 * The SDK's IM will maintain the changes and periodically write to disk, and
 * the web server's IM will periodically read latest storage from disk.
 */
class IM final {
public:
  IM() { storage_.reset(new MemoryStorage(&executor_)); }
  // IM(StorageBase::Type type, StorageBase::Mode mode);
  ~IM() { executor_.Quit(); }

  void MaintainRead(const std::string &dir, int msecs) {
    LOG(INFO) << "start maintain read";
    dynamic_cast<MemoryStorage *>(storage_.get())
        ->StartReadService(dir, msecs, &lock_);
  }

  void MaintainWrite(const std::string &dir, int msecs) {
    dynamic_cast<MemoryStorage *>(storage_.get())
        ->StartWriteSerice(dir, msecs, &lock_);
  }

  /*
   * Set the disk path to store the Storage object.
   */
  void SetPersistDest(const std::string &path);

  storage::Tablet *AddTablet(const std::string &tag, int num_samples);

  /*
   * @tag: tag of the target Tablet.
   * @record: a record
   *
   * NOTE pass in the serialized protobuf message will trigger copying, but
   * simpler to support different Tablet data formats.
   */
  void AddRecord(const std::string &tag, const storage::Record &record);

  /*
   * delete all the information.
   */
  void Clear();

  /*
   * Save the Storage Protobuf to disk.
   */
  void PersistToDisk();

  StorageBase &storage() { return *storage_; }

  cc::PeriodExector &executor() { return executor_; }

  std::mutex &handler() { return lock_; }

private:
  // read write lock for protobuf in memory
  std::mutex lock_;
  std::unique_ptr<StorageBase> storage_;
  cc::PeriodExector executor_;
};

}  // namespace visualdl

#endif  // VISUALDL_BACKEND_LOGIC_IM_H
