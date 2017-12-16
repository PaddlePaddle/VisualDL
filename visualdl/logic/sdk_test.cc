#include "visualdl/logic/sdk.h"

#include <gtest/gtest.h>

namespace visualdl {

struct ScalarTestHelper {
  ImHelper rim;
  ImHelper wim;
  const std::string dir = "./tmp/1.test";

  void operator()(std::function<void()> read, std::function<void()> write) {
    wim.StartWriteSerice(dir, 200);
    write();

    rim.StartReadService(dir, 200);
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

}  // namespace visualdl
