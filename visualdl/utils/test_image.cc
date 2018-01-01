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

