#include "visualdl/logic/im.h"

#include "gtest/gtest.h"

namespace visualdl {

class ImTester : public ::testing::Test {
protected:
  void SetUp() override {}

  IM &im = IM::Global();
};

TEST_F(ImTester, AddTablet) {
  im.Clear();
  im.AddTablet("tag0", 20);
}

TEST_F(ImTester, AddRecord) {
  im.Clear();

  im.AddTablet("tag0", 20);
  for (int i = 0; i < 100; i++) {
    storage::Record rcd;
    rcd.set_dtype(storage::DataType::kInt32s);
    for (int j = 0; j < 10; j++) {
      rcd.add_data()->add_i32s(i * 20 + j);
    }
    im.AddRecord("tag0", rcd);
  }

  ASSERT_EQ(im.storage().tablet("tag0")->records_size(), 100UL);
}

}  // namespace visualdl
