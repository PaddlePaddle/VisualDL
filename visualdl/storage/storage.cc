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

#include "visualdl/storage/storage.h"

namespace visualdl {

Storage::Storage() {
  dir_ = std::make_shared<std::string>();
  data_ = std::make_shared<storage::Storage>();
  tablets_ = std::make_shared<std::map<std::string, storage::Tablet>>();
  modes_ = std::make_shared<std::set<std::string>>();
  modified_tablet_set_ = std::unordered_set<std::string>();
  time_t t;
  time(&t);
  data_->set_timestamp(t);
}

Storage::Storage(const Storage& other)
    : data_(other.data_), tablets_(other.tablets_), modes_(other.modes_) {
  dir_ = other.dir_;
}

Storage::~Storage() { PersistToDisk(); }

void Storage::AddMode(const std::string& x) {
  // avoid duplicate modes.
  if (modes_->count(x) != 0) return;
  *data_->add_modes() = x;
  modes_->insert(x);
  WRITE_GUARD
}

Tablet Storage::AddTablet(const std::string& x) {
  CHECK(tablets_->count(x) == 0) << "tablet [" << x << "] has existed";
  (*tablets_)[x] = storage::Tablet();
  AddTag(x);
  MarkTabletModified(x);
  // WRITE_GUARD
  PersistToDisk();
  return Tablet(&(*tablets_)[x], this);
}

void Storage::SetDir(const std::string& dir) { *dir_ = dir; }

std::string Storage::dir() const { return *dir_; }

void Storage::PersistToDisk() { PersistToDisk(*dir_); }

void Storage::PersistToDisk(const std::string& dir) {
  CHECK(!dir.empty()) << "dir should be set.";
  fs::TryRecurMkdir(dir);

  fs::SerializeToFile(*data_, meta_path(dir));
  for (auto tag : data_->tags()) {
    if (modified_tablet_set_.count(tag) > 0) {
      auto it = tablets_->find(tag);
      CHECK(it != tablets_->end()) << "tag " << tag << " not exist.";
      fs::SerializeToFile(it->second, tablet_path(dir, tag));
    }
  }
  modified_tablet_set_.clear();
}

Storage* Storage::parent() { return this; }

void Storage::MarkTabletModified(const std::string tag) {
  modified_tablet_set_.insert(tag);
}

void Storage::AddTag(const std::string& x) {
  *data_->add_tags() = x;
  WRITE_GUARD
}

// StorageReader
std::vector<std::string> StorageReader::all_tags() {
  storage::Storage storage;
  Reload(storage);
  return std::vector<std::string>(storage.tags().begin(), storage.tags().end());
}

std::vector<std::string> StorageReader::tags(Tablet::Type component) {
  auto tags = all_tags();
  auto it =
      std::remove_if(tags.begin(), tags.end(), [&](const std::string& tag) {
        auto tb = tablet(tag);
        return tb.type() != component;
      });
  tags.resize(it - tags.begin());
  return tags;
}

std::vector<std::string> StorageReader::modes() {
  storage::Storage storage;
  Reload(storage);
  return std::vector<std::string>(storage.modes().begin(),
                                  storage.modes().end());
}

TabletReader StorageReader::tablet(const std::string& tag) const {
  auto path = tablet_path(dir_, tag);
  storage::Tablet tablet;
  fs::DeSerializeFromFile(&tablet, path);
  return TabletReader(tablet);
}

}  // namespace visualdl
