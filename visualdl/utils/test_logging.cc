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
  } catch (const visualdl::logging::Error& e) {
    LOG(INFO) << "in exception";
  } catch (...) {}
}
