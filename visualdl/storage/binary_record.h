/* Copyright (c) 2017 VisualDL Authors. All Rights Reserve.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

#ifndef VISUALDL_STORAGE_BINARY_RECORD_H
#define VISUALDL_STORAGE_BINARY_RECORD_H

#include <fstream>
#include <functional>
#include <sstream>

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
  BinaryRecord(const std::string dir, std::string&& data)
      : data_(data), dir_(dir) {
    filename_ = GenerateFileName();
    path_ = dir + "/" + filename_;
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

  static std::string GenerateFileName() {
    std::stringstream ss;
    ss << counter_++;
    return ss.str();
  }

  const std::string& filename() { return filename_; }

private:
  std::string dir_;
  std::string path_;
  std::string data_;
  std::string filename_;
  static int counter_;
};

// Initial static counter variable.
int BinaryRecord::counter_ = 0;

struct BinaryRecordReader {
  std::string data;

  BinaryRecordReader(const std::string& dir, const std::string& filename)
      : dir_(dir), filename_(filename) {
    fromfile();
  }

  const std::string& filename() { return filename_; }

protected:
  void fromfile() {
    // filename_ can be empty if a user stops training abruptly.  In that case,
    // we shouldn't load the file. The server will hang if we try to load the
    // empty file. For now we don't throw an assert since it causes performance
    // problems on the server.
    // TODO(thuan): Update SDK.cc to not add image record if user stops training
    // abruptly and no filename_ is set.
    // TODO(thuan): Optimize visualDL server retry logic when a request fails.
    // Currently if SDK call fails, server will issue multiple retries,
    // which impacts performance.
    if (!filename_.empty()) {
      std::string path = dir_ + "/" + filename_;
      std::ifstream file(path, file.binary);
      CHECK(file.is_open()) << " failed to open file " << path;

      size_t size;
      file.read(reinterpret_cast<char*>(&size), sizeof(size_t));
      data.resize(size);
      file.read(&data[0], size);
    }
  }

private:
  std::string dir_;
  std::string filename_;
};

}  // namespace visualdl
#endif
