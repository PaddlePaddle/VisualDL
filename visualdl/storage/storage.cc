#include <glog/logging.h>
#include <fstream>

#include "visualdl/storage/storage.h"
#include "visualdl/utils/concurrency.h"
#include "visualdl/utils/filesystem.h"

namespace visualdl {

const std::string StorageBase::meta_file_name = "storage.meta";

std::string StorageBase::meta_path(const std::string &dir) const {
  CHECK(!dir.empty()) << "dir is empty";
  return dir + "/" + meta_file_name;
}
std::string StorageBase::tablet_path(const std::string &dir,
                                     const std::string &tag) const {
  CHECK(!dir.empty()) << "dir should be set first";
  return dir + "/" + tag;
}

storage::Tablet *MemoryStorage::NewTablet(const std::string &tag,
                                          int num_samples) {
  auto it = tablets_.find(tag);
  if (it == tablets_.end()) {
    // create new tablet
    tablets_[tag] = storage::Tablet();
    tablets_[tag].set_tag(tag);
    *storage_.add_tags() = tag;
  } else {
    return &it->second;
  }
  return &tablets_[tag];
}

storage::Tablet *MemoryStorage::tablet(const std::string &tag) {
  auto it = tablets_.find(tag);
  CHECK(it != tablets_.end()) << "tablet tagged as " << tag << " not exists";
  return &it->second;
}

// TODO add some checksum to avoid unnecessary saving
void MemoryStorage::PersistToDisk(const std::string &dir) {
  CHECK(!dir.empty());
  storage_.set_dir(dir);
  // make a directory if not exist
  fs::TryMkdir(dir);
  // write storage out
  LOG(INFO) << "to serize meta to dir " << dir;
  fs::SerializeToFile(storage_, meta_path(dir));
  LOG(INFO) << "serize meta to dir " << dir;
  // write all the tablets
  for (auto tag : storage_.tags()) {
    auto it = tablets_.find(tag);
    CHECK(it != tablets_.end());
    fs::SerializeToFile(it->second, tablet_path(dir, tag));
  }
}

// TODO add some checksum to avoid unnecessary loading
void MemoryStorage::LoadFromDisk(const std::string &dir) {
  CHECK(!dir.empty()) << "dir is empty";
  storage_.set_dir(dir);
  // load storage
  CHECK(fs::DeSerializeFromFile(&storage_, meta_path(dir)))
      << "parse from " << meta_path(dir) << " failed";

  // load all the tablets
  for (int i = 0; i < storage_.tags_size(); i++) {
    auto tag = storage_.tags(i);
    CHECK(fs::DeSerializeFromFile(&tablets_[tag], tablet_path(dir, tag)));
  }
}

void MemoryStorage::StartReadService(const std::string &dir,
                                     int msecs,
                                     std::mutex *handler) {
  CHECK(executor_ != nullptr);
  CHECK(!dir.empty()) << "dir should be set first";
  cc::PeriodExector::task_t task = [dir, this, handler] {
    LOG(INFO) << "loading from " << dir;
    if (handler != nullptr) {
      std::lock_guard<std::mutex> _(*handler);
      LoadFromDisk(dir);
    } else {
      LoadFromDisk(dir);
    }
    return true;
  };
  // executor_.Start();
  LOG(INFO) << "push read task";
  (*executor_)(std::move(task), msecs);
}

void MemoryStorage::StartWriteSerice(const std::string &dir,
                                     int msecs,
                                     std::mutex *handler) {
  CHECK(executor_ != nullptr);
  CHECK(!dir.empty()) << "dir should be set first";
  storage_.set_dir(dir);
  // executor_.Start();
  cc::PeriodExector::task_t task = [dir, handler, this] {
    LOG(INFO) << "persist to disk";
    if (handler != nullptr) {
      std::lock_guard<std::mutex> _(*handler);
      PersistToDisk(dir);
    } else {
      PersistToDisk(dir);
    }
    return true;
  };
  (*executor_)(std::move(task), msecs);
}
}  // namespace visualdl
