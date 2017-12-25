#include "visualdl/logic/sdk.h"

#include <gtest/gtest.h>

namespace visualdl {

TEST(Scalar, write) {
  const auto dir = "./tmp/sdk_test";
  Storage storage;
  // write disk every time
  storage.meta.cycle = 1;
  storage.SetDir(dir);
  auto tablet = storage.AddTablet("scalar0");
  components::Scalar<int> scalar(tablet);
  scalar.SetCaption("train");
  scalar.AddRecord(0, 12);
  storage.PersistToDisk();

  // read from disk
  StorageReader reader(dir);
  auto tablet_reader = reader.tablet("scalar0");
  auto scalar_reader = components::ScalarReader<int>(std::move(tablet_reader));
  auto captioin = scalar_reader.caption();
  ASSERT_EQ(captioin, "train");
  ASSERT_EQ(scalar_reader.total_records(), 1);
  auto record = scalar_reader.records();
  ASSERT_EQ(record.size(), 1);
  // check the first entry of first record
  ASSERT_EQ(record.front(), 12);
}

}  // namespace visualdl
