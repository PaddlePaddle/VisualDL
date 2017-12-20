#include <glog/logging.h>
#include <ctime>

#include "visualdl/logic/im.h"

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

void IM::SetPersistDest(const std::string &path) {
  CHECK(storage_->mutable_data()->dir().empty())
      << "duplicate set storage's path";
  storage_->mutable_data()->set_dir(path);
}

storage::Tablet *IM::AddTablet(const std::string &tag, int num_samples) {
  auto tablet = storage_->NewTablet(tag, num_samples);
  return tablet;
}

void IM::AddRecord(const std::string &tag, const storage::Record &data) {
  auto *tablet = storage_->tablet(tag);
  CHECK(tablet) << "no tablet called " << tag;

  auto num_records = tablet->total_records();
  const auto num_samples = tablet->num_samples();

  int offset;
  // use reservoir sampling or not
  if (num_samples > 0) {
    offset = ReserviorSample(num_samples, num_records + 1);
    if (offset < 0) return;
  } else {
    offset = num_records;
  }

  storage::Record *record;
  if (offset >= num_records) {
    record = tablet->add_records();
  } else {
    record = tablet->mutable_records(offset);
  }

  *record = data;
  tablet->set_total_records(num_records + 1);
}

void IM::Clear() {
  auto *data = storage().mutable_data();
  data->clear_tablets();
  data->clear_dir();
  data->clear_timestamp();
}

void IM::PersistToDisk() {
  CHECK(!storage_->data().dir().empty()) << "path of storage should be set";
  // TODO make dir first
  // MakeDir(storage_.data().dir());
  storage_->PersistToDisk(storage_->data().dir());
}

}  // namespace visualdl
