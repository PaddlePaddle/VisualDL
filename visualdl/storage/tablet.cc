#include "visualdl/storage/tablet.h"

namespace visualdl {

TabletReader Tablet::reader() { return TabletReader(*data_); }

}  // namespace visualdl
