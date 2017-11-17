#ifndef VISUALDL_STORAGE_H
#define VISUALDL_STORAGE_H

#include <string>
#include <time.h>

#include "visualdl/backend/storage/storage.pb.h"

namespace visualdl {

class Storage final {
 public:
  /*
   * There should be only one Storage instance in memory.
   */
  Storage &Global() {
    static Storage *instance = new Storage();
    return *instance;
  }

  /*
   * Add a new tablet named `tag`, the newly added instance will be returned.
   */
  storage::Tablet *Add(const std::string &tag);

  /*
   * Search the tablet named `tag`, if not exist, return nullptr.
   */
  const storage::Tablet *Find(const std::string &tag) const;

  /*
   * Serialize this object to string and save it to a file.
   */
  void Save(const std::string &path) const;

  /*
   * Load the Protobuf message from a file.
   */
  void Load(const std::string &path);

 protected:
  /*
   * Serialize the Storage instance to string.
   */
  std::string Serialize() const;

  /*
   * De-serialize from a string and update this Storage instance.
   */
  void DeSerialize(const std::string &data);

  Storage() {
    // set time stamp
    time_t time0;
    time(&time0);
    proto_.set_timestamp(time0);
  }

 private:
  storage::Storage proto_;
};

} // namespace visualdl

#endif //VISUALDL_STORAGE_H
