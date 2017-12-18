#ifndef VISUALDL_UTILS_FILESYSTEM_H
#define VISUALDL_UTILS_FILESYSTEM_H

#include <google/protobuf/text_format.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <unistd.h>
#include <fstream>

namespace visualdl {

namespace fs {

template <typename T>
std::string Serialize(const T& proto, bool human_readable = false) {
  if (human_readable) {
    std::string buffer;
    google::protobuf::TextFormat::PrintToString(proto, &buffer);
    return buffer;
  }
  return proto.SerializeAsString();
}

template <typename T>
bool DeSerialize(T* proto, const std::string buf, bool human_readable = false) {
  // NOTE human_readable not valid
  if (human_readable) {
    return google::protobuf::TextFormat::ParseFromString(buf, proto);
  }
  return proto->ParseFromString(buf);
}

template <typename T>
bool SerializeToFile(const T& proto, const std::string& path) {
  std::ofstream file(path, std::ios::binary);
  return proto.SerializeToOstream(&file);
}

template <typename T>
bool DeSerializeFromFile(T* proto, const std::string& path) {
  std::ifstream file(path, std::ios::binary);
  CHECK(file.is_open()) << "open " << path << " failed";
  return proto->ParseFromIstream(&file);
}

void TryMkdir(const std::string& dir) {
  LOG(INFO) << "try to mkdir " << dir;
  struct stat st = {0};
  if (stat(dir.c_str(), &st) == -1) {
    ::mkdir(dir.c_str(), 0700);
  }
}

// Create a path by recursively create directries
void TryRecurMkdir(const std::string& path) {
  // split path by '/'
  for (int i = 1; i < path.size() - 1; i++) {
    if (path[i] == '/') {
      auto dir = path.substr(0, i + 1);
      TryMkdir(dir);
    }
  }
  // the last level
  TryMkdir(path);
}

inline void Write(const std::string& path,
                  const std::string& buffer,
                  std::ios::openmode open_mode = std::ios::binary) {
  VLOG(1) << "write to path " << path;
  std::ofstream file(path, open_mode);
  CHECK(file.is_open()) << "failed to open " << path;
  file.write(buffer.c_str(), buffer.size());
  file.close();
}

inline std::string Read(const std::string& path,
                        std::ios::openmode open_mode = std::ios::binary) {
  VLOG(1) << "read from path " << path;
  std::string buffer;
  std::ifstream file(path, open_mode | std::ios::ate);
  CHECK(file.is_open()) << "failed to open " << path;
  size_t size = file.tellg();
  file.seekg(0);
  buffer.resize(size);
  file.read(&buffer[0], size);
  return buffer;
}

}  // namespace fs

}  // namespace visualdl

#endif  // VISUALDL_BACKEND_UTILS_FILESYSTEM_H
