#ifndef VISUALDL_STORAGE_STORAGE_H
#define VISUALDL_STORAGE_STORAGE_H

#include <glog/logging.h>
#include <vector>

#include "visualdl/storage/storage.pb.h"
#include "visualdl/storage/tablet.h"

namespace visualdl {

/*
 * Helper for operations on storage::Storage.
 */
struct Storage {
  Storage() {}
  Storage(storage::Storage* x) : data_(x) {
    time_t t;
    time(&t);
    data_->set_timestamp(t);
  }

  std::vector<std::string> Modes() {
    return std::vector<std::string>(data_->modes().begin(),
                                    data_->modes().end());
  }

  void AddMode(const std::string& x) { *data_->add_modes() = x; }

  Tablet AddTablet(const std::string& x) {
    AddTag(x);
    CHECK(tablets_.count(x) == 0) << "tablet [" << x << "] has existed";
    tablets_[x] = storage::Tablet();
    return Tablet(&tablets_[x]);
  }

protected:
  void AddTag(const std::string& x) { *data_->add_tags() = x; }

private:
  std::map<std::string, storage::Tablet> tablets_;
  storage::Storage* data_{nullptr};
};

}  // namespace visualdl

#endif
