#include "visualdl/utils/concurrency.h"

#include <glog/logging.h>
#include <gtest/gtest.h>

namespace visualdl {

int counter = 0;

TEST(concurrency, test) {
  cc::PeriodExector executor;
  cc::PeriodExector::task_t task = [&]() {
    LOG(INFO) << "Hello " << counter++;
    if (counter > 5) return false;
    return true;
  };
  executor(std::move(task), 200);
}

}  // namespace visualdl
