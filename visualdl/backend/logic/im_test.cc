#include "visualdl/backend/logic/im.h"

#include "gtest/gtest.h"

namespace visualdl {

class ImTester : public ::testing::Test {
protected:
  void SetUp() override {}

  InformationMaintainer &im = InformationMaintainer::Global();
};

TEST_F(ImTester, AddTablet) { im.AddTablet("tag0", 20); }

TEST_F(ImTester, AddRecord) {
  storage::Record rcd;
  rcd.set_dtype(storage::DataType::kInt32s);
  for (int i = 0; i < 100; i++) {
    for (int j = 0; j < 10; j++) {
      rcd.add_data()->add_i32s(i * 20 + j);
    }
    im.AddRecord("tag0", rcd);
  }

  ASSERT_EQ(im.storage().Find("tag0")->records_size(), 20UL);
}

}  // namespace visualdl
