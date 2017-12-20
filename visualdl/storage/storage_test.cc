#include "visualdl/storage/storage.h"

#include <glog/logging.h>
#include <gtest/gtest.h>

namespace visualdl {
using namespace std;

class MemoryStorageTest : public ::testing::Test {
public:
  void SetUp() override { storage_.SetStorage("./tmp"); }

  MemoryStorage storage_;
};

TEST_F(MemoryStorageTest, SetStorage) {
  string dir = "./tmp";
  storage_.SetStorage(dir);

  ASSERT_EQ(storage_.data().dir(), dir);
}

TEST_F(MemoryStorageTest, AddTablet) {
  // TODO need to escape tag as name
  string tag = "add%20tag0";
  storage_.NewTablet(tag, -1);

  auto* tablet = storage_.tablet(tag);

  ASSERT_TRUE(tablet != nullptr);
  ASSERT_EQ(tablet->tag(), tag);
}

TEST_F(MemoryStorageTest, PersistToDisk) {
  const std::string dir = "./tmp/201.test";
  storage_.SetStorage(dir);
  string tag = "add%20tag0";
  storage_.NewTablet(tag, -1);

  storage_.PersistToDisk(dir);
  LOG(INFO) << "persist to disk";

  MemoryStorage other;
  other.LoadFromDisk(dir);
  LOG(INFO) << "read from disk";
  ASSERT_EQ(other.data().SerializeAsString(),
            storage_.data().SerializeAsString());
}

}  // namespace visualdl
