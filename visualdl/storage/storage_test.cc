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
