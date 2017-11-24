#ifndef VISUALDL_BACKEND_LOGIC_IM_H
#define VISUALDL_BACKEND_LOGIC_IM_H

#include <glog/logging.h>
#include <memory>
#include <string>

#include "visualdl/backend/storage/storage.h"

namespace visualdl {

/*
 * InformationMaintainer(IM) maintain the Storage singleton in memory,
 * pre-compute some the statistical information to help visualizaton.
 *
 * There should be two processes and each have an IM, one is the web server
 * which hold one IM to read the storage, the other is the SDK(python or C++),
 * it will get an IM to write latest changes to storage.
 *
 * An IM have an underlying Storage object, which might be a memory based
 * storage or a disk based one, both has the same interfaces those defined by
 * class StorageBase.
 *
 * The SDK's IM will maintain the changes and periodically write to disk, and
 * the web server's IM will periodically read latest storage from disk.
 */
class InformationMaintainer final {
public:
  InformationMaintainer(StorageBase::Type type = StorageBase::Type::kMemory) {
    switch (type) {
      case StorageBase::Type::kMemory:
        storage_.reset(new MemoryStorage);
        break;
      default:
        CHECK(false) << "Unsupported storage kind " << type;
    }
  }

  static InformationMaintainer &Global() {
    static InformationMaintainer *x = new InformationMaintainer();
    return *x;
  }

  /*
   * Set the disk path to store the Storage object.
   */
  void SetPersistDest(const std::string &path);

  storage::Tablet *AddTablet(const std::string &tag, int num_samples);

  /*
   * @tag: tag of the target Tablet.
   * @record: a record
   *
   * NOTE pass in the serialized protobuf message will trigger copying, but
   * simpler to support different Tablet data formats.
   */
  void AddRecord(const std::string &tag, const storage::Record &record);

  /*
   * delete all the information.
   */
  void Clear();

  /*
   * Save the Storage Protobuf to disk.
   */
  void PersistToDisk();

  StorageBase &storage() { return *storage_; }

private:
  std::unique_ptr<StorageBase> storage_;
};

}  // namespace visualdl

#endif  // VISUALDL_BACKEND_LOGIC_IM_H
