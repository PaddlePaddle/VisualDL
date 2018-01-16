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

#include "visualdl/storage/entry.h"

namespace visualdl {

#define IMPL_ENTRY_SET_OR_ADD(method__, ctype__, dtype__, opr__) \
  template <>                                                    \
  void Entry::method__<ctype__>(ctype__ v) {                     \
    entry->set_dtype(storage::DataType::dtype__);                \
    entry->opr__(v);                                             \
    WRITE_GUARD                                                  \
  }

#define IMPL_ENTRY_SETMUL(ctype__, dtype__, field__)              \
  template <>                                                     \
  void Entry::SetMulti<ctype__>(const std::vector<ctype__>& vs) { \
    entry->set_dtype(storage::DataType::dtype__);                 \
    entry->clear_##field__();                                     \
    for (auto v : vs) {                                           \
      entry->add_##field__(v);                                    \
    }                                                             \
    WRITE_GUARD                                                   \
  }

template <>
void Entry::Set<std::vector<byte_t>>(std::vector<byte_t> v) {
  entry->set_dtype(storage::DataType::kBytes);
  entry->set_y(std::string(v.begin(), v.end()));
  WRITE_GUARD
}

template <>
void Entry::Add<std::vector<byte_t>>(std::vector<byte_t> v) {
  entry->set_dtype(storage::DataType::kBytess);
  *entry->add_ys() = std::string(v.begin(), v.end());
  WRITE_GUARD
}

IMPL_ENTRY_SET_OR_ADD(Set, int, kInt32, set_i32);
IMPL_ENTRY_SET_OR_ADD(Set, std::string, kString, set_s);
IMPL_ENTRY_SET_OR_ADD(Set, int64_t, kInt64, set_i64);
IMPL_ENTRY_SET_OR_ADD(Set, bool, kBool, set_b);
IMPL_ENTRY_SET_OR_ADD(Set, float, kFloat, set_f);
IMPL_ENTRY_SET_OR_ADD(Set, double, kDouble, set_d);
IMPL_ENTRY_SET_OR_ADD(Add, int, kInt32s, add_i32s);
IMPL_ENTRY_SET_OR_ADD(Add, int64_t, kInt64s, add_i64s);
IMPL_ENTRY_SET_OR_ADD(Add, float, kFloats, add_fs);
IMPL_ENTRY_SET_OR_ADD(Add, double, kDoubles, add_ds);
IMPL_ENTRY_SET_OR_ADD(Add, std::string, kStrings, add_ss);
IMPL_ENTRY_SET_OR_ADD(Add, bool, kBools, add_bs);

IMPL_ENTRY_SETMUL(int, kInt32, i32s);
IMPL_ENTRY_SETMUL(int64_t, kInt64, i64s);
IMPL_ENTRY_SETMUL(float, kFloat, fs);
IMPL_ENTRY_SETMUL(double, kDouble, ds);
IMPL_ENTRY_SETMUL(bool, kBool, bs);

#define IMPL_ENTRY_GET(T, fieldname__) \
  template <>                          \
  T EntryReader::Get<T>() const {      \
    return data_.fieldname__();        \
  }

IMPL_ENTRY_GET(int, i32);
IMPL_ENTRY_GET(int64_t, i64);
IMPL_ENTRY_GET(float, f);
IMPL_ENTRY_GET(double, d);
IMPL_ENTRY_GET(std::string, s);
IMPL_ENTRY_GET(bool, b);

template <>
std::vector<uint8_t> EntryReader::Get<std::vector<byte_t>>() const {
  const auto& y = data_.y();
  return std::vector<byte_t>(y.begin(), y.end());
}

#define IMPL_ENTRY_GET_MULTI(T, fieldname__)           \
  template <>                                          \
  std::vector<T> EntryReader::GetMulti<T>() const {    \
    return std::vector<T>(data_.fieldname__().begin(), \
                          data_.fieldname__().end());  \
  }

IMPL_ENTRY_GET_MULTI(int, i32s);
IMPL_ENTRY_GET_MULTI(int64_t, i64s);
IMPL_ENTRY_GET_MULTI(float, fs);
IMPL_ENTRY_GET_MULTI(double, ds);
IMPL_ENTRY_GET_MULTI(std::string, ss);
IMPL_ENTRY_GET_MULTI(bool, bs);

}  // namespace visualdl
