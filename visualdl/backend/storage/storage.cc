#include <glog/logging.h>
#include <fstream>

#include "visualdl/backend/storage/storage.h"
#include "visualdl/backend/utils/filesystem.h"

namespace visualdl {

std::string GenPathFromTag(const std::string &dir, const std::string &tag) {
  return dir + "/" + tag;
}

const std::string StorageBase::meta_file_name = "storage.meta";

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

void MemoryStorage::PersistToDisk() const {
  VLOG(3) << "persist storage to disk path " << storage_.dir();
  // make a directory if not exist
  fs::TryMkdir(storage_.dir());
  // write storage out
  CHECK(!storage_.dir().empty()) << "storage's dir should be set first";
  const auto meta_path = storage_.dir() + "/" + meta_file_name;
  fs::Write(meta_path, fs::Serialize(storage_));
  // write all the tablets
  for (auto tag : storage_.tags()) {
    auto path = GenPathFromTag(storage_.dir(), tag);
    auto it = tablets_.find(tag);
    CHECK(it != tablets_.end());
    fs::Write(path, fs::Serialize(it->second));
  }
}

void MemoryStorage::LoadFromDisk(const std::string &dir) {
  VLOG(3) << "load storage from disk path " << dir;
  CHECK(!dir.empty()) << "dir is empty";
  // load storage
  const auto meta_path = dir + "/" + meta_file_name;
  auto buf = fs::Read(meta_path);
  CHECK(fs::DeSerialize(&storage_, buf))
      << "failed to parse protobuf loaded from " << meta_path;

  // load all the tablets
  for (int i = 0; i < storage_.tags_size(); i++) {
    std::string tag = storage_.tags(i);
    auto path = GenPathFromTag(storage_.dir(), tag);
    CHECK(tablets_[tag].ParseFromString(fs::Read(path)))
        << "failed to parse protobuf text loaded from " << path;
  }
}

}  // namespace visualdl
