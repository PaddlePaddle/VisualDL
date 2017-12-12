#include "visualdl/backend/utils/concurrency.h"

#include <glog/logging.h>
#include <gtest/gtest.h>

namespace visualdl {

int counter = 0;

TEST(concurrency, test) {
  cc::PeriodExector::task_t task = [&counter]() {
    LOG(INFO) << "Hello " << counter++;
    if (counter > 5) return false;
    return true;
  };
  cc::PeriodExector::Global()(std::move(task), 200);
}

}  // namespace visualdl