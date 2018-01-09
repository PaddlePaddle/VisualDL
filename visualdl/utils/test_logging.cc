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
