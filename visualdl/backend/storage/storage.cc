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
  // write storage out
  const auto meta_path = storage_.dir() + "/" + meta_file_name;
  fs::Write(meta_path, storage_.SerializeAsString());
  // write all the tablets
  for (auto tag : storage_.tags()) {
    auto path = GenPathFromTag(storage_.dir(), tag);
    auto it = tablets_.find(tag);
    CHECK(it != tablets_.end());
    fs::Write(path, it->second.SerializeAsString());
  }
}

void MemoryStorage::LoadFromDisk(const std::string &dir) {
  // load storage
  const auto meta_path = storage_.dir() + "/" + meta_file_name;
  storage_.ParseFromString(fs::Read(meta_path));

  // load all the tablets
  for (auto tag : storage_.tags()) {
    auto path = GenPathFromTag(storage_.dir(), tag);
    tablets_[tag];
    tablets_[tag].ParseFromString(fs::Read(path));
  }
}

storage::Tablet *Storage::Add(const std::string &tag, int num_samples) {
  auto *tablet = &(*proto_.mutable_tablets())[tag];
  tablet->set_num_samples(num_samples);
  return tablet;
}

storage::Tablet *Storage::Find(const std::string &tag) {
  auto it = proto_.mutable_tablets()->find(tag);
  if (it != proto_.tablets().end()) {
    return &it->second;
  }
  return nullptr;
}

storage::Record *Storage::NewRecord(const std::string &tag) {
  auto *tablet = Find(tag);
  CHECK(tablet) << "Tablet" << tag << " should be create first";
  auto *record = tablet->mutable_records()->Add();
  // increase num_records
  int num_records = tablet->total_records();
  tablet->set_total_records(num_records + 1);
  return record;
}
storage::Record *Storage::GetRecord(const std::string &tag, int offset) {
  auto *tablet = Find(tag);
  CHECK(tablet) << "Tablet" << tag << " should be create first";

  auto num_records = tablet->total_records();
  CHECK_LT(offset, num_records) << "invalid offset";
  return tablet->mutable_records()->Mutable(offset);
}

void Storage::Save(const std::string &path) const {
  std::ofstream file(path, file.binary | file.out);
  CHECK(file.is_open()) << "can't open path " << path;
  auto str = Serialize();
  file.write(str.c_str(), str.size());
}

void Storage::Load(const std::string &path) {
  std::ifstream file(path, file.binary);
  CHECK(file.is_open()) << "can't open path " << path;
  size_t size = file.tellg();
  std::string buffer(size, ' ');
  file.seekg(0);
  file.read(&buffer[0], size);
  DeSerialize(buffer);
}

std::string Storage::Serialize() const { return proto_.SerializeAsString(); }

void Storage::DeSerialize(const std::string &data) {
  proto_.ParseFromString(data);
}

}  // namespace visualdl
