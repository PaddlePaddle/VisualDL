#ifndef VISUALDL_UTILS_GLOG_EXCEPTION_INSTALLER_H
#define VISUALDL_UTILS_GLOG_EXCEPTION_INSTALLER_H

#include <glog/logging.h>
#include <exception>

namespace visualdl {

struct __GlogExceptionInstaller {
  __GlogExceptionInstaller() {
    google::InstallFailureFunction(
        &__GlogExceptionInstaller::MyFailureFunction);
  }

  static void MyFailureFunction() {
    if (!exception_thrown) {
      exception_thrown = true;
      throw std::exception();
      exit(1);
    }
  }

  static bool exception_thrown;
};

bool __GlogExceptionInstaller::exception_thrown{false};
}
#endif
