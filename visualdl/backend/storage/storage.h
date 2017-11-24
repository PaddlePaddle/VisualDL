#ifndef VISUALDL_STORAGE_H
#define VISUALDL_STORAGE_H

#include <time.h>
#include <string>

#include "visualdl/backend/storage/storage.pb.h"

namespace visualdl {

class Storage final {
public:
  Storage() {
    // set time stamp
    time_t time0;
    time(&time0);
    proto_.set_timestamp(time0);
  }

  /*
   * Add a new tablet named `tag`, the newly added instance will be returned.
   */
  storage::Tablet *Add(const std::string &tag, int num_samples);

  /*
   * Search the tablet named `tag`, if not exist, return nullptr.
   */
  storage::Tablet *Find(const std::string &tag);

  /*
   * Append a new record to the tail of tablet.
   */
  storage::Record *NewRecord(const std::string &tag);

  /*
   * Get a record at `offset`, if the offset is not valid, yield a failed CHECK.
   */
  storage::Record *GetRecord(const std::string &tag, int offset);

  /*
   * Serialize this object to string and save it to a file.
   */
  void Save(const std::string &path) const;

  /*
   * Load the Protobuf message from a file.
   */
  void Load(const std::string &path);

  storage::Storage *mutable_data() { return &proto_; }

  const storage::Storage &data() { return proto_; }

protected:
  /*
   * Serialize the Storage instance to string.
   */
  std::string Serialize() const;

  /*
   * De-serialize from a string and update this Storage instance.
   */
  void DeSerialize(const std::string &data);

private:
  storage::Storage proto_;
};

}  // namespace visualdl

#endif  // VISUALDL_STORAGE_H
