#include "visualdl/logic/sdk.h"

#include <gtest/gtest.h>

namespace visualdl {

struct ScalarTestHelper {
  ImHelper _rim;
  ImHelper _wim;
  ImHelper rim = _rim.AsMode("train");
  ImHelper wim = _wim.AsMode("train");
  const std::string dir = "./tmp/sdk_test.test";

  void operator()(std::function<void()> read, std::function<void()> write) {
    wim.StartWriteSerice(dir, 200);
    write();

    // should wait for the write service create log's path
    std::this_thread::sleep_for(std::chrono::milliseconds(400));
    rim.StartReadService(dir, 100);
    // should wait for the read service to load "tag0" tablet into memory
    std::this_thread::sleep_for(std::chrono::milliseconds(600));
    read();
  }
};

TEST(Scalar, set_caption) {
  ScalarTestHelper helper;

  const std::vector<std::string> captions({"train", "test"});

  auto write = [&] {
    auto tablet = helper.wim.AddTablet("tag0", -1);
    components::ScalarHelper<float> scalar(tablet, &helper.wim.handler());

    scalar.SetCaptions(captions);
  };

  auto read = [&] {
    auto mytablet = helper.rim.tablet("tag0");
    components::ScalarHelper<float> myscalar(mytablet, &helper.rim.handler());
    auto mycaptions = myscalar.GetCaptions();

    ASSERT_EQ(captions, mycaptions);
  };

  helper(read, write);
}

TEST(Scalar, add_records) {
  ScalarTestHelper helper;

  const std::vector<std::string> captions({"train", "test"});

  const size_t nsteps = 100;

  auto write = [&] {
    auto tablet = helper.wim.AddTablet("tag0", -1);
    components::ScalarHelper<float> scalar(tablet, &helper.wim.handler());

    scalar.SetCaptions(captions);

    for (int i = 0; i < nsteps; i++) {
      scalar.AddRecord(i * 10, std::vector<float>({(float)i, (float)i + 1}));
    }
  };

  auto read = [&] {
    auto mytablet = helper.rim.tablet("tag0");
    components::ScalarHelper<float> myscalar(mytablet, &helper.rim.handler());

    auto records = myscalar.GetRecords();
    ASSERT_EQ(records.size(), nsteps);

    for (int i = 0; i < nsteps; i++) {
      ASSERT_EQ(records[i], std::vector<float>({(float)i, (float)i + 1}));
    }
  };

  helper(read, write);
}

TEST(Scalar, mode) {
  ScalarTestHelper helper;
  auto train_wim = helper.wim.AsMode("train");

  auto write = [&] {
    auto tablet = train_wim.AddTablet("tag1", -1);
    components::ScalarHelper<float> scalar(tablet, &train_wim.handler());

    scalar.SetCaptions(std::vector<std::string>({"train"}));
    scalar.AddRecord(10, std::vector<float>({0.1}));
  };

  auto reader = [&] {};
}

}  // namespace visualdl
