#ifndef VISUALDL_STORAGE_STORAGE_H
#define VISUALDL_STORAGE_STORAGE_H

#include <glog/logging.h>
#include <vector>
#include <set>

#include "visualdl/logic/im.h"
#include "visualdl/utils/guard.h"
#include "visualdl/storage/storage.pb.h"
#include "visualdl/storage/tablet.h"
#include "visualdl/utils/filesystem.h"

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

  Storage() { data_ = std::make_shared<storage::Storage>(); }
  Storage(const std::shared_ptr<storage::Storage>& x) : data_(x) {
    time_t t;
    time(&t);
    data_->set_timestamp(t);
  }

  // write operations
  void AddMode(const std::string& x) {
    // avoid duplicate modes.
    if (modes_.count(x) != 0) return;
    *data_->add_modes() = x;
    modes_.insert(x);
    WRITE_GUARD
  }

  Tablet AddTablet(const std::string& x) {
    CHECK(tablets_.count(x) == 0) << "tablet [" << x << "] has existed";
    tablets_[x] = storage::Tablet();
    AddTag(x);
    LOG(INFO) << "really add tag " << x;
    WRITE_GUARD
    return Tablet(&tablets_[x], this);
  }

  void SetDir(const std::string& dir) { dir_ = dir; }
  void PersistToDisk() { PersistToDisk(dir_); }
  /*
   * Save memory to disk.
   */
  void PersistToDisk(const std::string& dir) {
    // LOG(INFO) << "persist to disk " << dir;
    CHECK(!dir.empty()) << "dir should be set.";
    fs::TryRecurMkdir(dir);

    fs::SerializeToFile(*data_, meta_path(dir));
    for (auto tag : data_->tags()) {
      auto it = tablets_.find(tag);
      CHECK(it != tablets_.end()) << "tag " << tag << " not exist.";
      fs::SerializeToFile(it->second, tablet_path(dir, tag));
    }
  }

  Storage* parent() { return this; }

protected:
  void AddTag(const std::string& x) {
    *data_->add_tags() = x;
  }

private:
  std::string dir_;
  std::map<std::string, storage::Tablet> tablets_;
  std::shared_ptr<storage::Storage> data_;
  std::set<std::string> modes_;
};

/*
 * Storage reader, each interface will trigger a read.
 */
struct StorageReader {
  StorageReader(const std::string& dir) : dir_(dir) {}

  // read operations
  std::vector<std::string> Tags() {
    storage::Storage storage;
    Reload(storage);
    return std::vector<std::string>(storage.tags().begin(),
                                    storage.tags().end());
  }
  std::vector<std::string> Modes() {
    storage::Storage storage;
    Reload(storage);
    return std::vector<std::string>(storage.modes().begin(),
                                    storage.modes().end());
  }

  TabletReader tablet(const std::string& tag) const {
    auto path = tablet_path(dir_, tag);
    storage::Tablet tablet;
    fs::DeSerializeFromFile(&tablet, path);
    return TabletReader(tablet);
  }

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
