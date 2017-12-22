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
class Scalar {
public:
  Scalar(Tablet tablet) : tablet_(tablet) { tablet_->SetTag(kScalar); }
  void SetCaption(const std::string cap) {
    tablet_->SetCaptions(std::vector<std::string>({cap}));
  }

private:
  Tablet tablet_;
};

}  // namespace components
}  // namespace visualdl

#endif
