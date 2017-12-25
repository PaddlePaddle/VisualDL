#ifndef VISUALDL_UTILS_STRING_H
#define VISUALDL_UTILS_STRING_H

#include <sstream>
#include <string>

namespace visualdl {
namespace string {

static void TagEncode(std::string& tag) {
  for (auto& c : tag) {
    if (c == '/') {
      c = '%';
    }
  }
}

static void TagDecode(std::string& tag) {
  for (auto& c : tag) {
    if (c == '%') {
      c = '/';
    }
  }
}

}  // namespace string
}  // namespace visualdl

#endif
