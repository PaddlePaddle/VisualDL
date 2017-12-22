#include "visualdl/storage/entry.h"

namespace visualdl {

#define IMPL_ENTRY_SET_OR_ADD(method__, ctype__, dtype__, opr__) \
  template <>                                                    \
  void Entry<ctype__>::method__(ctype__ v) {                     \
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
  T EntryReader<T>::Get() const {      \
    data_.fieldname__();               \
  }

IMPL_ENTRY_GET(int32_t, i32);
IMPL_ENTRY_GET(int64_t, i64);
IMPL_ENTRY_GET(float, f);
IMPL_ENTRY_GET(double, d);
IMPL_ENTRY_GET(std::string, s);
IMPL_ENTRY_GET(bool, b);

#define IMPL_ENTRY_GET_MULTI(T, fieldname__)           \
  template <>                                          \
  std::vector<T> EntryReader<T>::GetMulti() const {    \
    return std::vector<T>(data_.fieldname__().begin(), \
                          data_.fieldname__().end());  \
  }

IMPL_ENTRY_GET_MULTI(int32_t, i32s);
IMPL_ENTRY_GET_MULTI(int64_t, i64s);
IMPL_ENTRY_GET_MULTI(float, fs);
IMPL_ENTRY_GET_MULTI(double, ds);
IMPL_ENTRY_GET_MULTI(std::string, ss);
IMPL_ENTRY_GET_MULTI(bool, bs);

}  // namespace visualdl
