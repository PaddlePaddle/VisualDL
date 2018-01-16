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

#include "visualdl/storage/storage.h"

#include <gtest/gtest.h>
#include <memory>

namespace visualdl {
class StorageTest : public ::testing::Test {
public:
  void SetUp() {
    storage.SetDir("./tmp/storage_test");
    storage.meta.cycle = 1;
  }

  Storage storage;
};

TEST_F(StorageTest, main) {
  storage.AddMode("train");
  storage.AddMode("test");

  auto tag0 = storage.AddTablet("tag0");
  auto tag1 = storage.AddTablet("tag1");
  auto record = tag0.AddRecord();
  auto entry = record.AddData();
  entry.Set(12);

  StorageReader reader("./tmp/storage_test");
  auto modes = reader.modes();

  ASSERT_EQ(modes.size(), 2);
  ASSERT_EQ(modes[0], "train");
  ASSERT_EQ(modes[1], "test");
}

}  // namespace visualdl
