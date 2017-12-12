#include <glog/logging.h>
#include <fstream>

#include "visualdl/storage/storage.h"
#include "visualdl/utils/concurrency.h"
#include "visualdl/utils/filesystem.h"

namespace visualdl {

const std::string StorageBase::meta_file_name = "storage.meta";

std::string StorageBase::meta_path() const {
  CHECK(!storage_.dir().empty()) << "storage.dir should be set first";
  return storage_.dir() + "/" + meta_file_name;
}
std::string StorageBase::tablet_path(const std::string &tag) const {
  CHECK(!storage_.dir().empty()) << "storage.dir should be set first";
  return storage_.dir() + "/" + tag;
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
void MemoryStorage::PersistToDisk() const {
  CHECK(!storage_.dir().empty()) << "storage's dir should be set first";
  VLOG(3) << "persist storage to disk path " << storage_.dir();
  // make a directory if not exist
  fs::TryMkdir(storage_.dir());
  // write storage out
  fs::SerializeToFile(storage_, meta_path());
  // write all the tablets
  for (auto tag : storage_.tags()) {
    auto it = tablets_.find(tag);
    CHECK(it != tablets_.end());
    fs::SerializeToFile(it->second, tablet_path(tag));
  }
}

// TODO add some checksum to avoid unnecessary loading
void MemoryStorage::LoadFromDisk(const std::string &dir) {
  CHECK(!dir.empty()) << "dir is empty";
  storage_.set_dir(dir);
  // load storage
  CHECK(fs::DeSerializeFromFile(&storage_, meta_path()))
      << "parse from " << meta_path() << " failed";

  // load all the tablets
  for (int i = 0; i < storage_.tags_size(); i++) {
    auto tag = storage_.tags(i);
    CHECK(fs::DeSerializeFromFile(&tablets_[tag], tablet_path(tag)));
  }
}

void MemoryStorage::StartReadService() {
  cc::PeriodExector::task_t task = [this] {
    VLOG(3) << "loading from " << storage_.dir();
    LoadFromDisk(storage_.dir());
    return true;
  };
  cc::PeriodExector::Global().Start();
  VLOG(3) << "push read task";
  cc::PeriodExector::Global()(std::move(task), 2512);
}

void MemoryStorage::StartWriteSerice() {
  cc::PeriodExector::Global().Start();
  cc::PeriodExector::task_t task = [this] {
    PersistToDisk();
    return true;
  };
  cc::PeriodExector::Global()(std::move(task), 2000);
}
}  // namespace visualdl
