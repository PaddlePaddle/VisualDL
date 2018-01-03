#include "visualdl/logic/sdk.h"

#include <gtest/gtest.h>

using namespace std;

namespace visualdl {

TEST(Scalar, write) {
  const auto dir = "./tmp/sdk_test";
  LogWriter writer__(dir, 1);
  auto writer = writer__.AsMode("train");
  // write disk every time
  auto tablet = writer.AddTablet("scalar0");
  components::Scalar<int> scalar(tablet);
  scalar.AddRecord(0, 12);
  auto tablet1 = writer.AddTablet("model/layer/min");
  components::Scalar<float> scalar1(tablet1);
  scalar1.SetCaption("customized caption");

  // read from disk
  LogReader reader_(dir);
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

  ASSERT_TRUE(!reader.storage().modes().empty());

  // check tags
  ASSERT_EQ(reader_.all_tags().size(), 1);
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
  LogWriter writer__(dir, 4);
  auto writer = writer__.AsMode("train");

  auto tablet = writer.AddTablet("image0");
  components::Image image(tablet, 3, 1);
  const int num_steps = 10;

  LOG(INFO) << "write images";
  image.SetCaption("this is an image");
  for (int step = 0; step < num_steps; step++) {
    image.StartSampling();
    for (int i = 0; i < 7; i++) {
      vector<int64_t> shape({5, 5, 3});
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

  LOG(INFO) << "read images";
  // read it
  LogReader reader__(dir);
  auto reader = reader__.AsMode("train");
  auto tablet2read = reader.tablet("image0");
  components::ImageReader image2read("train", tablet2read);
  CHECK_EQ(image2read.caption(), "this is an image");
  CHECK_EQ(image2read.num_records(), num_steps);
}

TEST(Scalar, more_than_one_mode) {
  const auto dir = "./tmp/sdk_multi_mode";
  LogWriter log(dir, 20);

  std::vector<components::Scalar<float>> scalars;

  for (int i = 0; i < 1; i++) {
    std::stringstream ss;
    ss << "mode-" << i;
    auto mode = ss.str();
    auto writer = log.AsMode(mode);
    ASSERT_EQ(writer.storage().dir(), dir);
    LOG(INFO) << "origin dir: " << dir;
    LOG(INFO) << "changed dir: " << writer.storage().dir();
    auto tablet = writer.AddTablet("add/scalar0");
    scalars.emplace_back(tablet);
  }

  for (int i = 0; i < 1; i++) {
    auto& scalar = scalars[i];

    for (int j = 0; j < 100; j++) {
      scalar.AddRecord(j, (float)j);
    }
  }
}

}  // namespace visualdl
