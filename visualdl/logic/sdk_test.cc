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
  scalar.AddRecord(1, 13);
  auto tablet1 = writer.AddTablet("model/layer/min");
  components::Scalar<float> scalar1(tablet1);
  scalar1.SetCaption("customized caption");

  // read from disk
  LogReader reader_(dir);
  auto reader = reader_.AsMode("train");
  auto tablet_reader = reader.tablet("scalar0");
  auto scalar_reader = components::ScalarReader<int>(std::move(tablet_reader));
  auto caption = scalar_reader.caption();
  ASSERT_EQ(caption, "train");
  // reference PR#225
  ASSERT_EQ(scalar_reader.total_records(), 2);
  auto record = scalar_reader.records();
  // reference PR#225
  ASSERT_EQ(record.size(), 2);
  // check the first entry of first record
  ASSERT_EQ(record.front(), 12);

  ASSERT_TRUE(!reader.storage().modes().empty());

  // check tags
  ASSERT_EQ(reader_.all_tags().size(), 1);
  auto tags = reader.tags("scalar");
  ASSERT_EQ(tags.size(), 2);
  ASSERT_EQ(tags.front(), "scalar0");
  ASSERT_EQ(tags[1], "model/layer/min");
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
      int index = image.IndexOfSampleTaken();
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

TEST(Image, add_sample_test) {
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
      image.AddSample(shape, data);
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

TEST(Audio, test) {
  const auto dir = "./tmp/sdk_test.audio";
  LogWriter writer__(dir, 4);
  auto writer = writer__.AsMode("train");

  auto tablet = writer.AddTablet("audio0");
  components::Audio audio(tablet, 3, 1);
  const int num_steps = 10;

  LOG(INFO) << "write audio";
  audio.SetCaption("this is an audio");
  for (int step = 0; step < num_steps; step++) {
    audio.StartSampling();
    for (int i = 0; i < 7; i++) {
      vector<int32_t> shape({16000, 2, 2});
      vector<uint8_t> data;
      for (int j = 0; j < 16000 * 2 * 2; j++) {
        data.push_back(rand() % 256);
      }
      int index = audio.IndexOfSampleTaken();
      if (index != -1) {
        audio.SetSample(index, shape, data);
      }
    }
    audio.FinishSampling();
  }

  LOG(INFO) << "read audio";
  // read it
  LogReader reader__(dir);
  auto reader = reader__.AsMode("train");
  auto tablet2read = reader.tablet("audio0");
  components::AudioReader audio2read("train", tablet2read);
  CHECK_EQ(audio2read.caption(), "this is an audio");
  CHECK_EQ(audio2read.num_records(), num_steps);
}

TEST(Audio, add_sample_test) {
  const auto dir = "./tmp/sdk_test.audio";
  LogWriter writer__(dir, 4);
  auto writer = writer__.AsMode("train");

  auto tablet = writer.AddTablet("audio0");
  components::Audio audio(tablet, 3, 1);
  const int num_steps = 10;

  LOG(INFO) << "write audio";
  audio.SetCaption("this is an audio");
  for (int step = 0; step < num_steps; step++) {
    audio.StartSampling();
    for (int i = 0; i < 7; i++) {
      vector<uint8_t> data;
      for (int j = 0; j < 16000 * 2 * 2; j++) {
        data.push_back(rand() % 256);
      }
    }
    audio.FinishSampling();
  }

  LOG(INFO) << "read audio";
  // read it
  LogReader reader__(dir);
  auto reader = reader__.AsMode("train");
  auto tablet2read = reader.tablet("audio0");
  components::AudioReader audio2read("train", tablet2read);
  CHECK_EQ(audio2read.caption(), "this is an audio");
  CHECK_EQ(audio2read.num_records(), num_steps);
}

TEST(Histogram, AddRecord) {
  const auto dir = "./tmp/sdk_test.histogram";
  LogWriter writer__(dir, 1);
  auto writer = writer__.AsMode("train");

  auto tablet = writer.AddTablet("histogram0");
  components::Histogram<float> histogram(tablet, 10);

  std::vector<float> data(1000);
  for (auto& v : data) {
    v = (float)rand() / RAND_MAX;
  }

  histogram.AddRecord(10, data);
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
