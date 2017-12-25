#ifndef VISUALDL_LOGIC_SDK_H
#define VISUALDL_LOGIC_SDK_H

#include "visualdl/storage/storage.h"
#include "visualdl/storage/tablet.h"
#include "visualdl/utils/string.h"
namespace visualdl {

const static std::string kDefaultMode{"default"};

class Writer {
public:
  Writer(const std::string& dir, int sync_cycle) {
    storage_.SetDir(dir);
    storage_.meta.cycle = sync_cycle;
  }
  Writer(const Writer& other) {
    storage_ = other.storage_;
    mode_ = other.mode_;
  }

  Writer AsMode(const std::string& mode) {
    Writer writer = *this;
    storage_.AddMode(mode);
    writer.mode_ = mode;
    return writer;
  }

  Tablet AddTablet(const std::string& tag) {
    // TODO(ChunweiYan) add string check here.
    auto tmp = mode_ + "/" + tag;
    string::TagEncode(tmp);
    auto res = storage_.AddTablet(tmp);
    res.SetCaptions(std::vector<std::string>({mode_}));
    return res;
  }

  Storage& storage() { return storage_; }

private:
  Storage storage_;
  std::string mode_{kDefaultMode};
};

class Reader {
public:
  Reader(const std::string& dir) : reader_(dir) {}

  Reader AsMode(const std::string& mode) {
    auto tmp = *this;
    tmp.mode_ = mode;
    return tmp;
  }

  TabletReader tablet(const std::string& tag) {
    auto tmp = mode_ + "/" + tag;
    string::TagEncode(tmp);
    return reader_.tablet(tmp);
  }

  std::vector<std::string> all_tags() {
    auto tags = reader_.all_tags();
    auto it =
        std::remove_if(tags.begin(), tags.end(), [&](const std::string& tag) {
          return !TagMatchMode(tag);
        });
    tags.erase(it + 1);
    return tags;
  }

  std::vector<std::string> tags(const std::string& component) {
    auto type = Tablet::type(component);
    auto tags = reader_.tags(type);
    CHECK(!tags.empty());
    std::vector<std::string> res;
    for (const auto& tag : tags) {
      if (TagMatchMode(tag)) {
        res.push_back(GenReadableTag(tag));
      }
    }
    return res;
  }

  StorageReader& storage() { return reader_; }

protected:
  bool TagMatchMode(const std::string& tag) {
    if (tag.size() <= mode_.size()) return false;
    return tag.substr(0, mode_.size()) == mode_;
  }
  std::string GenReadableTag(const std::string& tag) {
    auto tmp = tag;
    string::TagDecode(tmp);
    return tmp.substr(mode_.size() + 1);  // including `/`
  }

private:
  StorageReader reader_;
  std::string mode_{kDefaultMode};
};

namespace components {

/*
 * Read and write support for Scalar component.
 */
template <typename T>
struct Scalar {
  Scalar(Tablet tablet) : tablet_(tablet) {
    tablet_.SetType(Tablet::Type::kScalar);
  }

  void SetCaption(const std::string cap) {
    tablet_.SetCaptions(std::vector<std::string>({cap}));
  }

  void AddRecord(int id, T value) {
    auto record = tablet_.AddRecord();
    record.SetId(id);
    auto entry = record.AddData<T>();
    entry.Set(value);
  }

private:
  Tablet tablet_;
};

template <typename T>
struct ScalarReader {
  ScalarReader(TabletReader&& reader) : reader_(reader) {}

  std::vector<T> records() const;
  std::vector<T> ids() const;
  std::vector<T> timestamps() const;
  std::string caption() const;
  size_t total_records() { return reader_.total_records(); }
  size_t size() const;

private:
  TabletReader reader_;
};

}  // namespace components
}  // namespace visualdl

#endif
