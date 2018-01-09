#include "gtest/gtest.h"

#include "visualdl/utils/logging.h"

int main(int argc, char **argv) {
  ::testing::InitGoogleTest(&argc, argv);
  std::signal(SIGINT, visualdl::log::SignalHandler);
  return RUN_ALL_TESTS();
}
