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
}
