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
