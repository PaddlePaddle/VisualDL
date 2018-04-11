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

#ifndef VISUALDL_STORAGE_STORAGE_H
#define VISUALDL_STORAGE_STORAGE_H

#include <algorithm>
#include <set>
#include <vector>

#include "visualdl/logic/im.h"
#include "visualdl/storage/storage.pb.h"
#include "visualdl/storage/tablet.h"
#include "visualdl/utils/filesystem.h"
#include "visualdl/utils/guard.h"
#include "visualdl/utils/logging.h"

namespace visualdl {
static const std::string meta_file_name = "storage.meta";

static std::string meta_path(const std::string& dir) {
  CHECK(!dir.empty()) << "dir is empty";
  return dir + "/" + meta_file_name;
}
static std::string tablet_path(const std::string& dir, const std::string& tag) {
  CHECK(!dir.empty()) << "dir is empty";
  return dir + "/" + tag;
}

// A simple logic to sync storage between memory and disk. Each writing
// operation will trigger an `Inc`, and check whether `ToSync`, if true, write
// memory to disk.
struct SimpleSyncMeta {
  void Inc() { counter++; }

  bool ToSync() { return counter % cycle == 0; }

  size_t counter{0};
  int cycle;
};

// Helper class for operations on storage::Storage.
struct Storage {
  DECL_GUARD(Storage)

  mutable SimpleSyncMeta meta;

  Storage();
  Storage(const Storage& other);
  ~Storage();
  // Add a mode. Mode is similar to TB's FileWriter, It can be "train" or "test"
  // or something else.
  void AddMode(const std::string& x);

  // Add a tablet which tag is `x`.
  Tablet AddTablet(const std::string& x);

  // Set storage's directory.
  void SetDir(const std::string& dir);
  std::string dir() const;

  // Save content in memory to `dir_`.
  void PersistToDisk();

  // Save content in memory to `dir`.
  void PersistToDisk(const std::string& dir);

  // A trick help to retrieve the storage's `SimpleSyncMeta`.
  Storage* parent();

  void MarkTabletModified(const std::string tag);

protected:
  // Add a tag which content is `x`.
  void AddTag(const std::string& x);

private:
  std::shared_ptr<std::string> dir_;
  std::shared_ptr<std::map<std::string, storage::Tablet>> tablets_;
  std::shared_ptr<storage::Storage> data_;
  std::shared_ptr<std::set<std::string>> modes_;
  std::unordered_set<std::string> modified_tablet_set_;
};

// Storage reader, each method will trigger a reading from disk.
struct StorageReader {
  StorageReader(const std::string& dir) : dir_(dir) {}

  // Get all tags of the storage.
  std::vector<std::string> all_tags();

  // Get all the tags of the tablet of the kind of `component`.
  std::vector<std::string> tags(Tablet::Type component);

  // Get all the modes of the storage.
  std::vector<std::string> modes();

  // Get a tablet whose tag is `tag`.
  TabletReader tablet(const std::string& tag) const;

protected:
  // Load meta from disk to memory.
  void Reload(storage::Storage& storage) {
    const std::string path = meta_path(dir_);
    fs::DeSerializeFromFile(&storage, path);
  }

private:
  std::string dir_;
};

}  // namespace visualdl

#endif
