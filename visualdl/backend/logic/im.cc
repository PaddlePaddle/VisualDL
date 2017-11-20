#include <ctime>
#include <glog/logging.h>

#include "visualdl/backend/logic/im.h"

namespace visualdl {

/*
 * @num_samples: number of instances to sample
 * @size: counter of the records.
 * @returns: id of the instance to replace, if drop this instance, return -1.
 */
int ReserviorSample(int num_samples, int num_records) {
  if (num_records <= num_samples) {
    return num_records;
  }

  std::srand(std::time(0));
  float prob = static_cast<float>(std::rand()) / RAND_MAX;
  float receive_prob = static_cast<float>(num_samples) / num_records;
  if (prob < receive_prob) {
    int offset2replace = std::rand() % num_samples;
    return offset2replace;
  }
  return -1;
}

void InformationMaintainer::SetPersistDest(const std::string &path) {
  CHECK(storage_.mutable_data()->dir().empty())
      << "duplicate set storage's path";
  storage_.mutable_data()->set_dir(path);
}

storage::Tablet *InformationMaintainer::AddTablet(const std::string &tag,
                                                  int num_samples) {
  auto *tablet = storage_.Find(tag);
  if (!tablet) {
    tablet = storage_.Add(tag, num_samples);
  }
  return tablet;
}

void InformationMaintainer::AddRecord(const std::string &tag,
                                      storage::Tablet::Type type,
                                      const std::string &data,
                                      storage::DataType dtype) {
  auto *tablet = storage_.Find(tag);
  CHECK(tablet);

  auto num_records = tablet->num_records();
  const auto num_samples = tablet->num_samples();
  const auto offset = ReserviorSample(num_samples, num_records + 1);
  if (offset < 0)
    return;

  storage::Record *record;
  if (offset >= num_records) {
    record = storage_.NewRecord(tag);
  } else {
    record = storage_.GetRecord(tag, offset);
  }

  record->set_dtype(dtype);
  record->ParseFromString(data);

  tablet->set_num_records(num_records + 1);
}

void InformationMaintainer::PersistToDisk() {
  CHECK(!storage_.data().dir().empty()) << "path of storage should be set";
  storage_.Save(storage_.data().dir());
}

} // namespace visualdl
