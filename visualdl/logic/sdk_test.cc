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

  // read from disk
  StorageReader reader(dir);
  auto scalar_reader = reader.tablet("scalar0");
  auto captioins = scalar_reader.captions();
  ASSERT_EQ(captioins.size(), 1);
  ASSERT_EQ(captioins.front(), "train");
  ASSERT_EQ(scalar_reader.total_records(), 1);
  auto record = scalar_reader.record(0);
  // check the first entry of first record
  auto vs = record.data<int>(0).Get();
  ASSERT_EQ(vs, 12);
}

}  // namespace visualdl
