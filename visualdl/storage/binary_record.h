#ifndef VISUALDL_STORAGE_BINARY_RECORD_H
#define VISUALDL_STORAGE_BINARY_RECORD_H

#include <fstream>
#include <functional>

#include "visualdl/utils/filesystem.h"

namespace visualdl {

static std::string GenBinaryRecordDir(const std::string& dir) {
  return dir + "/binary_records";
}

// A storage helper to save large file(currently just for Image component).
// The protobuf message has some limitation on meassage size, and LogWriter
// will maintain a memory of all the messages, it is bad to store images
// directly in protobuf. So a simple binary storage is used to serialize images
// to disk.
struct BinaryRecord {
  std::hash<std::string> hasher;

  BinaryRecord(const std::string dir, std::string&& data)
      : data_(data), dir_(dir) {
    hash_ = std::to_string(hasher(data));
    path_ = dir + "/" + hash();
  }

  const std::string& path() { return path_; }

  void tofile() {
    fs::TryRecurMkdir(dir_);
    std::fstream file(path_, file.binary | file.out);
    CHECK(file.is_open()) << "open " << path_ << " failed";

    size_t size = data_.size();
    file.write(reinterpret_cast<char*>(&size), sizeof(size));
    file.write(data_.data(), data_.size());
  }

  const std::string& hash() { return hash_; }

private:
  std::string dir_;
  std::string path_;
  std::string data_;
  std::string hash_;
};

struct BinaryRecordReader {
  std::string data;
  std::hash<std::string> hasher;

  BinaryRecordReader(const std::string& dir, const std::string& hash)
      : dir_(dir), hash_(hash) {
    fromfile();
  }
  std::string hash() { return std::to_string(hasher(data)); }

protected:
  void fromfile() {
    std::string path = dir_ + "/" + hash_;
    std::ifstream file(path, file.binary);
    CHECK(file.is_open()) << " failed to open file " << path;

    size_t size;
    file.read(reinterpret_cast<char*>(&size), sizeof(size_t));
    data.resize(size);
    file.read(&data[0], size);

    CHECK_EQ(hash(), hash_) << "data broken: " << path;
  }

private:
  std::string dir_;
  std::string hash_;
};

}  // namespace visualdl
#endif
