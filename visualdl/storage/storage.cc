#include "visualdl/storage/storage.h"

#include "visualdl/utils/glog_exception_installer.h"

namespace visualdl {

Storage::Storage() {
  dir_ = std::make_shared<std::string>();
  data_ = std::make_shared<storage::Storage>();
  tablets_ = std::make_shared<std::map<std::string, storage::Tablet>>();
  modes_ = std::make_shared<std::set<std::string>>();
  time_t t;
  time(&t);
  data_->set_timestamp(t);
}

Storage::Storage(const Storage& other)
    : data_(other.data_), tablets_(other.tablets_), modes_(other.modes_) {
  dir_ = other.dir_;
}

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
  LOG(INFO) << "really add tag " << x;
  // WRITE_GUARD
  PersistToDisk();
  return Tablet(&(*tablets_)[x], this);
}

void Storage::PersistToDisk() { PersistToDisk(*dir_); }

void Storage::PersistToDisk(const std::string& dir) {
  CHECK(!dir.empty()) << "dir should be set.";
  fs::TryRecurMkdir(dir);

  fs::SerializeToFile(*data_, meta_path(dir));
  for (auto tag : data_->tags()) {
    auto it = tablets_->find(tag);
    CHECK(it != tablets_->end()) << "tag " << tag << " not exist.";
    fs::SerializeToFile(it->second, tablet_path(dir, tag));
  }
}

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

__GlogExceptionInstaller __installer;

}  // namespace visualdl
