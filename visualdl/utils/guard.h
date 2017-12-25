#ifndef VISUALDL_UTILS_GUARD_H
#define VISUALDL_UTILS_GUARD_H

namespace visualdl {
namespace guard {

template <typename T>
class BasicGuard {
public:
  BasicGuard(const T* x) : data_(x) { start(); }
  ~BasicGuard() { end(); }

  void start() {}
  void end() {}

private:
  const T* data_;
};

#define DECL_GUARD(T)                         \
  using WriteGuard = SimpleWriteSyncGuard<T>; \
  using ReadGuard = guard::BasicGuard<T>;

// #define DECL_GUARD(T)                      \
//   using WriteGuard = guard::BasicGuard<T>; \
//   using ReadGuard = guard::BasicGuard<T>;

#define READ_GUARD ReadGuard _(this);
#define WRITE_GUARD WriteGuard _(this);

}  // namespace guard
}  // namespace visualdl

#endif
