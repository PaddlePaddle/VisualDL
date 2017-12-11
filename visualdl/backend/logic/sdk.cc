#include "visualdl/backend/logic/sdk.h"
#include <google/protobuf/text_format.h>

namespace visualdl {

#define IMPL_ENTRY_SET_OR_ADD(method__, ctype__, dtype__, opr__) \
  template <>                                                    \
  void EntryHelper<ctype__>::method__(ctype__ v) {               \
    entry->set_dtype(storage::DataType::dtype__);                \
    entry->opr__(v);                                             \
  }

IMPL_ENTRY_SET_OR_ADD(Set, int32_t, kInt32, set_i32);
IMPL_ENTRY_SET_OR_ADD(Set, int64_t, kInt64, set_i64);
IMPL_ENTRY_SET_OR_ADD(Set, bool, kBool, set_b);
IMPL_ENTRY_SET_OR_ADD(Set, float, kFloat, set_f);
IMPL_ENTRY_SET_OR_ADD(Set, double, kDouble, set_d);
IMPL_ENTRY_SET_OR_ADD(Add, int32_t, kInt32s, add_i32s);
IMPL_ENTRY_SET_OR_ADD(Add, int64_t, kInt64s, add_i64s);
IMPL_ENTRY_SET_OR_ADD(Add, float, kFloats, add_fs);
IMPL_ENTRY_SET_OR_ADD(Add, double, kDoubles, add_ds);
IMPL_ENTRY_SET_OR_ADD(Add, std::string, kStrings, add_ss);
IMPL_ENTRY_SET_OR_ADD(Add, bool, kBools, add_bs);

#define IMPL_ENTRY_GET(T, fieldname__) \
  template <>                          \
  T EntryHelper<T>::Get() const {      \
    return entry->fieldname__();       \
  }
IMPL_ENTRY_GET(int32_t, i32);
IMPL_ENTRY_GET(int64_t, i64);
IMPL_ENTRY_GET(float, f);
IMPL_ENTRY_GET(double, d);
IMPL_ENTRY_GET(std::string, s);
IMPL_ENTRY_GET(bool, b);

#define IMPL_ENTRY_GET_MULTI(T, fieldname__)            \
  template <>                                           \
  std::vector<T> EntryHelper<T>::GetMulti() const {     \
    return std::vector<T>(entry->fieldname__().begin(), \
                          entry->fieldname__().end());  \
  }

IMPL_ENTRY_GET_MULTI(int32_t, i32s);
IMPL_ENTRY_GET_MULTI(int64_t, i64s);
IMPL_ENTRY_GET_MULTI(float, fs);
IMPL_ENTRY_GET_MULTI(double, ds);
IMPL_ENTRY_GET_MULTI(std::string, ss);
IMPL_ENTRY_GET_MULTI(bool, bs);

std::string StorageHelper::human_readable_buffer() const {
  std::string buffer;
  google::protobuf::TextFormat::PrintToString(*data_, &buffer);
  return buffer;
}

std::string TabletHelper::human_readable_buffer() const {
  std::string buffer;
  google::protobuf::TextFormat::PrintToString(*data_, &buffer);
  return buffer;
}

// implementations for components
namespace components {

template <typename T>
void ScalarHelper<T>::SetCaptions(const std::vector<std::string> &captions) {
  CHECK_EQ(data_->captions_size(), 0UL) << "the captions can set only once";
  for (int i = 0; i < captions.size(); i++) {
    data_->add_captions(captions[i]);
  }
}

template <typename T>
void ScalarHelper<T>::AddRecord(int id, const std::vector<T> &values) {
  CHECK_NOTNULL(data_);
  CHECK_GT(data_->captions_size(), 0UL) << "captions should be set first";
  CHECK_EQ(data_->captions_size(), values.size())
      << "number of values in a record should be compatible with the "
         "captions";
  // add record data
  auto *record = data_->add_records();
  auto *data = record->add_data();
  EntryHelper<T> entry_helper(data);
  for (auto v : values) {
    entry_helper.Add(v);
  }
  // set record id
  record->set_id(id);
  // set record timestamp
  record->set_timestamp(time(NULL));
}

template <typename T>
std::vector<std::vector<T>> ScalarHelper<T>::GetRecords() const {
  std::vector<std::vector<T>> result;
  EntryHelper<T> entry_helper;
  for (int i = 0; i < data_->records_size(); i++) {
    auto *entry = data_->mutable_records(i)->mutable_data(0);
    entry_helper(entry);
    auto datas = entry_helper.GetMulti();
    result.push_back(std::move(datas));
  }
  return result;
}

template <typename T>
std::vector<int> ScalarHelper<T>::GetIds() const {
  CHECK_NOTNULL(data_);
  std::vector<int> result;
  for (int i = 0; i < data_->records_size(); i++) {
    result.push_back(data_->records(i).id());
  }
  return result;
}

template <typename T>
std::vector<int> ScalarHelper<T>::GetTimestamps() const {
  CHECK_NOTNULL(data_);
  std::vector<int> result;
  for (int i = 0; i < data_->records_size(); i++) {
    result.push_back(data_->records(i).timestamp());
  }
  return result;
}

template <typename T>
std::vector<std::string> ScalarHelper<T>::GetCaptions() const {
  return std::vector<std::string>(data_->captions().begin(),
                                  data_->captions().end());
}

template class ScalarHelper<int32_t>;
template class ScalarHelper<int64_t>;
template class ScalarHelper<float>;
template class ScalarHelper<double>;

}  // namespace components

}  // namespace visualdl
