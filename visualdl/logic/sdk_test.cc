#include "visualdl/logic/sdk.h"

#include <gtest/gtest.h>

using namespace std;

namespace visualdl {

TEST(Scalar, write) {
  const auto dir = "./tmp/sdk_test";
  Writer writer__(dir, 1);
  auto writer = writer__.AsMode("train");
  // write disk every time
  auto tablet = writer.AddTablet("scalar0");
  components::Scalar<int> scalar(tablet);
  scalar.AddRecord(0, 12);
  auto tablet1 = writer.AddTablet("model/layer/min");
  components::Scalar<float> scalar1(tablet1);
  scalar1.SetCaption("customized caption");

  // read from disk
  Reader reader_(dir);
  auto reader = reader_.AsMode("train");
  auto tablet_reader = reader.tablet("scalar0");
  auto scalar_reader = components::ScalarReader<int>(std::move(tablet_reader));
  auto captioin = scalar_reader.caption();
  ASSERT_EQ(captioin, "train");
  ASSERT_EQ(scalar_reader.total_records(), 1);
  auto record = scalar_reader.records();
  ASSERT_EQ(record.size(), 1);
  // check the first entry of first record
  ASSERT_EQ(record.front(), 12);

  // check tags
  ASSERT_EQ(reader.all_tags().size(), 1);
  auto tags = reader.tags("scalar");
  ASSERT_EQ(tags.size(), 2);
  ASSERT_EQ(tags.front(), "scalar0");
  ASSERT_EQ(tags[1], "model/layer/min");
  components::ScalarReader<float> scalar_reader1(
      reader.tablet("model/layer/min"));
  ASSERT_EQ(scalar_reader1.caption(), "customized caption");
}

TEST(Image, test) {
  const auto dir = "./tmp/sdk_test.image";
  Writer writer__(dir, 1);
  auto writer = writer__.AsMode("train");

  auto tablet = writer.AddTablet("image0");
  components::Image image(tablet, 3);

  image.StartSampling();
  for (int i = 0; i < 100; i++) {
    vector<int64_t> shape({3, 5, 5});
    vector<float> data;
    for (int j = 0; j < 3 * 5 * 5; j++) {
      data.push_back(float(rand()) / RAND_MAX);
    }
    int index = image.IsSampleTaken();
    if (index != -1) {
      image.SetSample(index, shape, data);
    }
  }
  image.FinishSampling();
}

}  // namespace visualdl
