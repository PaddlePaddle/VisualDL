#ifndef VISUALDL_UTILS_MACRO_H
#define VISUALDL_UTILS_MACRO_H

#define DECL_BASIC_TYPES_CLASS_IMPL(class__, name__) \
  template class__ name__<int32_t>;                  \
  template class__ name__<int64_t>;                  \
  template class__ name__<float>;                    \
  template class__ name__<double>;

#endif
