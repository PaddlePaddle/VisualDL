#include <cstdlib>
#include <iostream>
#include <jlcxx/jlcxx.hpp>
#include <string>
#include "visualdl/logic/sdk.h"
#include "visualdl/storage/storage.h"
#include "visualdl/storage/tablet.h"

namespace vs = visualdl;
namespace cp = visualdl::components;

struct WrapScalar {
  template <typename TypeWrapperT>
  void operator()(TypeWrapperT&& wrapped) {
    typedef typename TypeWrapperT::type WrappedT;
    wrapped.template constructor<vs::Tablet>();
    wrapped.method("setcaptions", &WrappedT::SetCaption);
    wrapped.method("addrecord", &WrappedT::AddRecord);
  }
};

JULIA_CPP_MODULE_BEGIN(registry)
jlcxx::Module& vdl = registry.create_module("VisualDLWrapper");

vdl.add_type<vs::Tablet>("Tablet");
vdl.add_type<vs::TabletReader>("TabletReader");
vdl.add_type<vs::Storage>("Storage");
vdl.add_type<vs::StorageReader>("StorageReader");

vdl.add_type<vs::LogWriter>("LogWriter")
    .constructor<const std::string&, int>()
    .constructor<const vs::LogWriter&>()
    .method("setmode", &vs::LogWriter::SetMode)
    .method("save", &vs::LogWriter::Save)
    .method("asmode", &vs::LogWriter::AsMode)
    .method("addtablet", &vs::LogWriter::AddTablet)
    .method("storage", &vs::LogWriter::storage);

vdl.add_type<vs::LogReader>("LogReader")
    .constructor<const std::string&>()
    .method("setmode", &vs::LogReader::SetMode)
    .method("asmode", &vs::LogReader::AsMode)
    .method("mode", &vs::LogReader::mode)
    .method("tablet", &vs::LogReader::tablet)
    .method("storage", &vs::LogReader::storage)
    .method("alltags",
            [](vs::LogReader& lr) {
              auto alltags = lr.all_tags();
              return jlcxx::ArrayRef<std::string, 1>(&(alltags[0]),
                                                     alltags.size());
            })
    .method("tags", [](vs::LogReader& lr, const std::string& x) {
      auto tags = lr.tags(x);
      return jlcxx::ArrayRef<std::string, 1>(&(tags[0]), tags.size());
    });

// components
vdl.add_type<jlcxx::Parametric<jlcxx::TypeVar<1>>>("Scalar")
    .apply<cp::Scalar<int>,
           cp::Scalar<long int>,
           cp::Scalar<float>,
           cp::Scalar<double>>(WrapScalar());

JULIA_CPP_MODULE_END