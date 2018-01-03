#ifndef VISUALDL_STORAGE_STORAGE_H
#define VISUALDL_STORAGE_STORAGE_H

#include <glog/logging.h>
#include <algorithm>
#include <set>
#include <vector>

#include "visualdl/logic/im.h"
#include "visualdl/storage/storage.pb.h"
#include "visualdl/storage/tablet.h"
#include "visualdl/utils/filesystem.h"
#include "visualdl/utils/guard.h"

namespace visualdl {
static const std::string meta_file_name = "storage.meta";

static std::string meta_path(const std::string& dir) {
  CHECK(!dir.empty()) << "dir is empty";
  return dir + "/" + meta_file_name;
}
static std::string tablet_path(const std::string& dir, const std::string& tag) {
  CHECK(!dir.empty()) << "dir should be set first";
  return dir + "/" + tag;
}

struct SimpleSyncMeta {
  void Inc() { counter++; }

  bool ToSync() { return counter % cycle == 0; }

  size_t counter{0};
  int cycle;
};

/*
 * Helper for operations on storage::Storage.
 */
struct Storage {
  DECL_GUARD(Storage)

  mutable SimpleSyncMeta meta;

  Storage();
  Storage(const Storage& other);

  void AddMode(const std::string& x);

  Tablet AddTablet(const std::string& x);

  void SetDir(const std::string& dir) { *dir_ = dir; }
  std::string dir() const { return *dir_; }

  void PersistToDisk();

  /*
   * Save memory to disk.
   */
  void PersistToDisk(const std::string& dir);

  Storage* parent() { return this; }

protected:
  void AddTag(const std::string& x) {
    *data_->add_tags() = x;
    WRITE_GUARD
  }

private:
  std::shared_ptr<std::string> dir_;
  std::shared_ptr<std::map<std::string, storage::Tablet>> tablets_;
  std::shared_ptr<storage::Storage> data_;
  std::shared_ptr<std::set<std::string>> modes_;
};

/*
 * Storage reader, each interface will trigger a read.
 */
struct StorageReader {
  StorageReader(const std::string& dir) : dir_(dir) {}

  // read operations
  std::vector<std::string> all_tags();

  std::vector<std::string> tags(Tablet::Type component);

  std::vector<std::string> modes();

  TabletReader tablet(const std::string& tag) const;

protected:
  void Reload(storage::Storage& storage) {
    const std::string path = meta_path(dir_);
    fs::DeSerializeFromFile(&storage, path);
  }

private:
  std::string dir_;
};

}  // namespace visualdl

#endif
