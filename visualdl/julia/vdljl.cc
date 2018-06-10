#include <iostream>
#include <jlcxx/jlcxx.hpp>
#include <cstdlib>
#include <string>
#include "visualdl/logic/sdk.h"

namespace vs = visualdl;
namespace cp = visualdl::components;


JULIA_CPP_MODULE_BEGIN(registry)
  jlcxx::Module& vdl = registry.create_module("VisualDL");

  vdl.add_type<LogWriter>("LogWriter")
    .constructor<const std::string&, int>
    .constructor<const LogWriter&>
    .method("setmode", &LogWriter::SetMode)
    .method("save", &LogWriter::Save)
    .method("asmode", &LogWriter::AsMode)
    .method("addtablet", &LogWriter::AddTablet)
    .method("getstorage", &LogWriter::storage)

JULIA_CPP_MODULE_END