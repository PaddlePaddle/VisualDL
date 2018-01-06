#include "visualdl/logic/histogram.h"

#include <gtest/gtest.h>
#include <cstdlib>

using namespace std;
using namespace visualdl;

TEST(HistogramBuilder, build) {
  const int size = 3000;
  std::vector<float> data(size);
  for (auto& v : data) {
    v = (float)rand() / RAND_MAX - 0.5;
  }

  HistogramBuilder<float> builder(100);
  builder(data);

  float left, right;
  int frequency;
  for (int i = 0; i < 100; i++) {
    builder.Get(i, &left, &right, &frequency);
    ASSERT_GT(frequency, 0);
  }
}
