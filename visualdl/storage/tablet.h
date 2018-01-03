#ifndef VISUALDL_TABLET_H
#define VISUALDL_TABLET_H

#include <glog/logging.h>

#include "visualdl/logic/im.h"
#include "visualdl/storage/record.h"
#include "visualdl/storage/storage.pb.h"
#include "visualdl/utils/string.h"

namespace visualdl {

struct TabletReader;

/*
 * Tablet is a helper for operations on storage::Tablet.
 */
struct Tablet {
  enum Type { kScalar = 0, kHistogram = 1, kImage = 2 };

  DECL_GUARD(Tablet);

  Tablet(storage::Tablet* x, Storage* parent) : data_(x), x_(parent) {}

  static Type type(const std::string& name) {
    if (name == "scalar") {
      return kScalar;
    }
    if (name == "histogram") {
      return kHistogram;
    }
    if (name == "image") {
      return kImage;
    }
    LOG(ERROR) << "unknown component: " << name;
  }

  // write operations.
  void SetNumSamples(int x) {
    data_->set_num_samples(x);
    WRITE_GUARD
  }

  void SetType(Type type) {
    data_->set_component(static_cast<storage::Tablet::Type>(type));
    WRITE_GUARD
  }

  void SetTag(const std::string& mode, const std::string& tag) {
    auto internal_tag = mode + "/" + tag;
    string::TagEncode(internal_tag);
    data_->set_tag(internal_tag);
    WRITE_GUARD
  }

  Record AddRecord() {
    IncTotalRecords();
    WRITE_GUARD
    return Record(data_->add_records(), parent());
  }

  template <typename T>
  Entry<T> MutableMeta() {
    Entry<T> x(data_->mutable_meta(), parent());
  }

  void SetCaptions(const std::vector<std::string>& xs) {
    data_->clear_captions();
    for (const auto& x : xs) {
      *data_->add_captions() = x;
    }
    WRITE_GUARD
  }

  void SetDescription(const std::string& x) {
    data_->set_description(x);
    WRITE_GUARD
  }

  void IncTotalRecords() {
    data_->set_total_records(data_->total_records() + 1);
    WRITE_GUARD
  }

  TabletReader reader();

  Storage* parent() const { return x_; }

private:
  Storage* x_;
  storage::Tablet* data_{nullptr};
};

/*
 * Tablet reader, it will hold the protobuf object.
 */
struct TabletReader {
  TabletReader(storage::Tablet x) : data_(x) {}

  // read operations.
  std::string tag() const { return data_.tag(); }
  Tablet::Type type() const { return Tablet::Type(data_.component()); }
  int64_t total_records() const { return data_.records_size(); }
  int32_t num_samples() const { return data_.num_samples(); }
  RecordReader record(int i) const { return RecordReader(data_.records(i)); }
  template <typename T>
  EntryReader<T> meta() const {
    return EntryReader<T>(data_.meta());
  }
  std::vector<std::string> captions() const {
    std::vector<std::string> x(data_.captions().begin(),
                               data_.captions().end());
    return x;
  }
  std::string description() const { return data_.description(); }

private:
  storage::Tablet data_;
};

}  // namespace visualdl

#endif
