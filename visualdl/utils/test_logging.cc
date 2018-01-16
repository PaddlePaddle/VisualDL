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

#ifdef VISUALDL_WITH_GLOG
#undef VISUALDL_WITH_GLOG
#endif
#include "visualdl/utils/logging.h"

#include <gtest/gtest.h>

TEST(Log, LOG) { LOG(INFO) << "hello world"; }

TEST(Log, CHECK) { CHECK_EQ(1, 1) << "yes this works"; }
TEST(Log, CHECK_FAIL) {
  try {
    CHECK_LE(3, 2) << "this is wrong";
    // throw std::runtime_error("some error");
  } catch (const visualdl::logging::Error& e) {
    LOG(INFO) << e.what();
    auto msg = std::string(e.what());
    auto it = msg.find("test_logging.cc:14");
    ASSERT_GT(it, 0);
  } catch (...) {
    LOG(INFO) << "catch something";
  }
}
