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

#include "visualdl/utils/image.h"

#include <gtest/gtest.h>

using namespace visualdl;

TEST(image, NormalizeImage) {
  Uint8Image image(128, 3);
  const int size = 128 * 3;
  float arr[size];

  for (int i = 0; i < size; i++) {
    // set a strange scale
    arr[i] = 234. * (rand() / RAND_MAX - 0.5);
  }

  NormalizeImage(&image, arr, 3, 128);
}
