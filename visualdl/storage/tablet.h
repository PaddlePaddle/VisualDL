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

#ifndef VISUALDL_TABLET_H
#define VISUALDL_TABLET_H

#include "visualdl/logic/im.h"
#include "visualdl/storage/record.h"
#include "visualdl/storage/storage.pb.h"
#include "visualdl/utils/logging.h"
#include "visualdl/utils/string.h"

namespace visualdl {

struct TabletReader;

/*
 * Tablet is a helper for operations on storage::Tablet.
 */
struct Tablet {
  enum Type {
    kScalar = 0,
    kHistogram = 1,
    kImage = 2,
    kText = 3,
    kAudio = 4,
    kEmbedding = 5,
    kUnknown = -1
  };

  DECL_GUARD(Tablet);

  Tablet(storage::Tablet* x, Storage* parent)
      : data_(x), x_(parent), internal_encoded_tag_("") {}

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
    if (name == "text") {
      return kText;
    }
    if (name == "audio") {
      return kAudio;
    }
    if (name == "embedding") {
      return kEmbedding;
    }
    LOG(ERROR) << "unknown component: " << name;
    return kUnknown;
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

  void SetTag(const std::string& mode, const std::string& tag);
  Record AddRecord();

  template <typename T>
  Entry MutableMeta() {
    Entry x(data_->mutable_meta(), parent());
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
  std::string internal_encoded_tag_;
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
  RecordReader record(int i) const {
    CHECK_LT(i, total_records());
    return RecordReader(data_.records(i));
  }
  template <typename T>
  EntryReader meta() const {
    return EntryReader(data_.meta());
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
