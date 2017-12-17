#ifndef VISUALDL_STORAGE_H
#define VISUALDL_STORAGE_H

#include <time.h>
#include <map>
#include <memory>
#include <string>

#include "visualdl/storage/storage.pb.h"
#include "visualdl/utils/concurrency.h"

namespace visualdl {

/*
 * Generate a tablet path in disk from its tag.
 */
inline std::string GenPathFromTag(const std::string &dir,
                                  const std::string &tag);

/*
 * Storage Interface. The might be a bunch of implementations, for example, a
 * MemStorage that keep a copy of all the taplets in memory, can be changed with
 * a higher performance; a DiskStorage that keep all the data in disk, apply to
 * the scenerios where memory consumption should be considered.
 */
class StorageBase {
public:
  const static std::string meta_file_name;

  enum Type { kMemory = 0, kDisk = 1 };
  // mode of the sevice, either reading or writing.
  enum Mode { kRead = 0, kWrite = 1, kNone = 2 };

  void SetStorage(const std::string &dir) {
    time_t t;
    time(&t);
    storage_.set_timestamp(t);
    storage_.set_dir(dir);
  }

  std::string meta_path(const std::string &dir) const;
  std::string tablet_path(const std::string &dir, const std::string &tag) const;

  /*
   * Create a new Tablet storage.
   */
  virtual storage::Tablet *NewTablet(const std::string &tag,
                                     int num_samples) = 0;

  /*
   * Get a tablet from memory, this can be viewed as a cache, if the storage is
   * in disk, a hash map in memory will first load the corresponding Tablet
   * Protobuf from disk and hold all the changes.
   */
  virtual storage::Tablet *tablet(const std::string &tag) = 0;

  /*
   * Persist the data from cache to disk. Both the memory storage or disk
   * storage should write changes to disk for persistence.
   */
  virtual void PersistToDisk(const std::string &dir) = 0;

  /*
   * Load data from disk.
   */
  virtual void LoadFromDisk(const std::string &dir) = 0;

  storage::Storage *mutable_data() { return &storage_; }
  const storage::Storage &data() { return storage_; }

protected:
  storage::Storage storage_;
};

/*
 * Storage in Memory, that will support quick edits on data.
 */
class MemoryStorage final : public StorageBase {
public:
  MemoryStorage() {}
  MemoryStorage(cc::PeriodExector *executor) : executor_(executor) {}
  ~MemoryStorage() {
    if (executor_ != nullptr) executor_->Quit();
  }
  storage::Tablet *NewTablet(const std::string &tag, int num_samples) override;

  storage::Tablet *tablet(const std::string &tag) override;

  void PersistToDisk(const std::string &dir) override;

  void LoadFromDisk(const std::string &dir) override;

  /*
   * Create a thread which will keep reading the latest data from the disk to
   * memory.
   *
   * msecs: how many millisecond to sync memory and disk.
   */
  void StartReadService(const std::string &dir, int msecs, std::mutex *handler);

  /*
   * Create a thread which will keep writing the latest changes from memory to
   * disk.
   *
   * msecs: how many millisecond to sync memory and disk.
   */
  void StartWriteSerice(const std::string &dir, int msecs, std::mutex *handler);

private:
  std::map<std::string, storage::Tablet> tablets_;
  // TODO(ChunweiYan) remove executor here.
  cc::PeriodExector *executor_{nullptr};
};

}  // namespace visualdl

#endif  // VISUALDL_STORAGE_H
