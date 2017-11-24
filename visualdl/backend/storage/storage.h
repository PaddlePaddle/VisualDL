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

class Storage final {
public:
  Storage() {
    // set time stamp
    time_t time0;
    time(&time0);
    proto_.set_timestamp(time0);
  }

  /*
   * Add a new tablet named `tag`, the newly added instance will be returned.
   */
  storage::Tablet *Add(const std::string &tag, int num_samples);

  /*
   * Search the tablet named `tag`, if not exist, return nullptr.
   */
  storage::Tablet *Find(const std::string &tag);

  /*
   * Append a new record to the tail of tablet.
   */
  storage::Record *NewRecord(const std::string &tag);

  /*
   * Get a record at `offset`, if the offset is not valid, yield a failed CHECK.
   */
  storage::Record *GetRecord(const std::string &tag, int offset);

  /*
   * Serialize this object to string and save it to a file.
   */
  void Save(const std::string &path) const;

  /*
   * Load the Protobuf message from a file.
   */
  void Load(const std::string &path);

  storage::Storage *mutable_data() { return &proto_; }

  const storage::Storage &data() { return proto_; }

protected:
  /*
   * Serialize the Storage instance to string.
   */
  std::string Serialize() const;

  /*
   * De-serialize from a string and update this Storage instance.
   */
  void DeSerialize(const std::string &data);

private:
  storage::Storage proto_;
};

}  // namespace visualdl

#endif  // VISUALDL_STORAGE_H
