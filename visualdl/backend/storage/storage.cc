#include <fstream>
#include <glog/logging.h>

#include "visualdl/backend/storage/storage.h"

namespace visualdl {

storage::Tablet *Storage::Add(const std::string &tag) {
  return &proto_.mutable_tablets()->at(tag);
}

const storage::Tablet *Storage::Find(const std::string &tag) const {
  auto it = proto_.tablets().find(tag);
  if (it != proto_.tablets().end()) {
    return &it->second;
  }
  return nullptr;
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

std::string Storage::Serialize() const {
  return proto_.SerializeAsString();
}

void Storage::DeSerialize(const std::string &data) {
  proto_.ParseFromString(data);
}

}  // namespace visualdl
