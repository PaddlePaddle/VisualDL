#ifndef VISUALDL_LOGIC_SDK_H
#define VISUALDL_LOGIC_SDK_H

#include "visualdl/storage/storage.h"
#include "visualdl/storage/tablet.h"

namespace visualdl {
namespace components {

/*
 * Read and write support for Scalar component.
 */
template <typename T>
struct Scalar {
  Scalar(Tablet tablet) : tablet_(tablet) { tablet_.SetType(Tablet::Type::kScalar);}
  void SetCaption(const std::string cap) {
    tablet_.SetCaptions(std::vector<std::string>({cap}));
  }

  void AddRecord(int id, const std::vector<T> &values);

private:
  Tablet tablet_;
};

template <typename T>
struct ScalarReader {
  ScalarReader(TabletReader&& reader) : reader_(reader) {}

  std::vector<T> records() const;
  std::vector<int> ids() const;
  std::vector<int> timestamps() const;
  std::vector<std::string> captions() const;
  size_t size() const;

 private:
  TabletReader reader_;
};

}  // namespace components
}  // namespace visualdl

#endif
