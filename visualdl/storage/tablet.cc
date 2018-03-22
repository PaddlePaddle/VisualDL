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

#include "visualdl/storage/tablet.h"
#include "visualdl/storage/storage.h"

namespace visualdl {

void Tablet::SetTag(const std::string& mode, const std::string& tag) {
  auto internal_tag = mode + "/" + tag;
  string::TagEncode(internal_tag);
  internal_encoded_tag_ = internal_tag;
  data_->set_tag(internal_tag);
  WRITE_GUARD
}

Record Tablet::AddRecord() {
  parent()->MarkTabletModified(internal_encoded_tag_);
  IncTotalRecords();
  WRITE_GUARD
  return Record(data_->add_records(), parent());
}

TabletReader Tablet::reader() { return TabletReader(*data_); }

}  // namespace visualdl
