#ifndef VISUALDL_LOGIC_SDK_H
#define VISUALDL_LOGIC_SDK_H

#include "visualdl/storage/storage.h"
#include "visualdl/storage/tablet.h"
#include "visualdl/utils/string.h"
namespace visualdl {

class Writer {
public:
  Writer(const std::string& dir) {
    storage_.SetDir(dir);
  }

  Writer& AsMode(const std::string& mode) {
    mode_ = mode;
    storage_.AddMode(mode);
    return *this;
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
  std::string mode_;
};

class Reader {
public:
  Reader(const std::string& mode, const std::string& dir)
      : mode_(mode), reader_(dir) {}

  TabletReader tablet(const std::string& tag) {
    auto tmp = mode_ + "/" + tag;
    string::TagEncode(tmp);
    return reader_.tablet(tmp);
  }

private:
  StorageReader reader_;
  std::string mode_{"default"};
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
  size_t total_records() {return reader_.total_records();}
  size_t size() const;

private:
  TabletReader reader_;
};


}  // namespace components
}  // namespace visualdl

#endif
