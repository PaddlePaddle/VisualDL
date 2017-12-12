#ifndef VISUALDL_UTILS_LOG_H
#define VISUALDL_UTILS_LOG_H

#include <stdexcept>

namespace visualdl {

namespace log {

class NotImplementedException : public std::logic_error {
public:
  NotImplementedException() : std::logic_error{"Function not implemented"} {}
};

}  // namespace log

}  // namespace visualdl

#endif
