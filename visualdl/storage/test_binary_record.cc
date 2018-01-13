#include "visualdl/storage/binary_record.h"

#include <gtest/gtest.h>

using namespace visualdl;

TEST(BinaryRecord, init) {
  std::string message = "hello world";
  BinaryRecord rcd("./", std::move(message));
  rcd.tofile();

  BinaryRecordReader reader("./", rcd.hash());
  LOG(INFO) << reader.data;
  ASSERT_EQ(reader.data, "hello world");
}
