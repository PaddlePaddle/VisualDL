#ifndef VISUALDL_STORAGE_H
#define VISUALDL_STORAGE_H

#include <time.h>
#include <map>
#include <string>

#include "visualdl/backend/storage/storage.pb.h"

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

  void SetStorage(const std::string &dir) {
    time_t t;
    time(&t);
    storage_.set_timestamp(t);
    storage_.set_dir(dir);
  }

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
  virtual void PersistToDisk() const = 0;

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
  storage::Tablet *NewTablet(const std::string &tag, int num_samples) override;

  storage::Tablet *tablet(const std::string &tag) override;

  void PersistToDisk() const override;

  void LoadFromDisk(const std::string &dir) override;

private:
  std::map<std::string, storage::Tablet> tablets_;
};

}  // namespace visualdl

#endif  // VISUALDL_STORAGE_H
