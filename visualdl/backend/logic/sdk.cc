#include <google/protobuf/text_format.h>
#include "visualdl/backend/logic/sdk.h"

namespace visualdl {

#define IMPL_ENTRY_SET_OR_ADD(method__, ctype__, dtype__, opr__)               \
  template <> void Entry<ctype__>::method__(ctype__ v) {                       \
    entry->set_dtype(storage::DataType::dtype__);                              \
    entry->opr__(v);                                                           \
  }

IMPL_ENTRY_SET_OR_ADD(Set, int32_t, kInt32, set_i32);
IMPL_ENTRY_SET_OR_ADD(Set, int64_t, kInt64, set_i64);
IMPL_ENTRY_SET_OR_ADD(Set, bool, kBool, set_b);
IMPL_ENTRY_SET_OR_ADD(Set, float, kFloat, set_f);
IMPL_ENTRY_SET_OR_ADD(Set, double, kDouble, set_d);
IMPL_ENTRY_SET_OR_ADD(Add, int32_t, kInt32s, add_i32s);
IMPL_ENTRY_SET_OR_ADD(Add, int64_t, kInt64s, add_i64s);
IMPL_ENTRY_SET_OR_ADD(Add, bool, kBools, add_bs);
IMPL_ENTRY_SET_OR_ADD(Add, float, kFloats, add_fs);
IMPL_ENTRY_SET_OR_ADD(Add, double, kDoubles, add_ds);

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

} // namespace visualdl
