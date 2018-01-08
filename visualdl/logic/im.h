#ifndef VISUALDL_LOGIC_IM_H
#define VISUALDL_LOGIC_IM_H

#include <memory>
#include <mutex>
#include <string>

#include "visualdl/utils/concurrency.h"
#include "visualdl/utils/guard.h"
#include "visualdl/utils/logging.h"

namespace visualdl {

/*
 * Simple logic to sync memory to disk.
 */
template <typename T>
class SimpleWriteSyncGuard {
public:
  SimpleWriteSyncGuard(T* x) : data_(x) { Start(); }
  ~SimpleWriteSyncGuard() { End(); }

  void Start();
  void End();
  void Sync();

private:
  T* data_{nullptr};
};

}  // namespace visualdl

#endif  // VISUALDL_BACKEND_LOGIC_IM_H
