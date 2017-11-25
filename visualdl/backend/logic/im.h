#ifndef VISUALDL_BACKEND_LOGIC_IM_H
#define VISUALDL_BACKEND_LOGIC_IM_H

#include <glog/logging.h>
#include <memory>
#include <string>

#include "visualdl/backend/storage/storage.h"

namespace visualdl {

/*
 * Maintain the Storage singleton in memory, pre-compute some the statical
 * information to help visualizaton.
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
