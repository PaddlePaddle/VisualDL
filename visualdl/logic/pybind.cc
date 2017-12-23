#include <ctype.h>
#include <pybind11/pybind11.h>
#include <pybind11/stl.h>

#include "visualdl/logic/sdk.h"

namespace py = pybind11;
namespace vs = visualdl;
namespace cp = visualdl::components;

PYBIND11_PLUGIN(core) {
  py::module m("core", "C++ core of VisualDL");

#define ADD_SCALAR(T)                                      \
  py::class_<cp::ScalarReader<T>>(m, "ScalarReader__" #T)  \
      .def("records", &cp::ScalarReader<T>::records)       \
      .def("timestamps", &cp::ScalarReader<T>::timestamps) \
      .def("captions", &cp::ScalarReader<T>::captions);
  ADD_SCALAR(int);
  ADD_SCALAR(float);
  ADD_SCALAR(double);
  ADD_SCALAR(int64_t);
#undef ADD_SCALAR

#define ADD_SCALAR_WRITER(T)                          \
  py::class_<cp::Scalar<T>>(m, "ScalarWriter__" #T)   \
      .def("set_caption", &cp::Scalar<T>::SetCaption) \
      .def("add_record", &cp::Scalar<T>::AddRecord);
  ADD_SCALAR_WRITER(int);
  ADD_SCALAR_WRITER(float);
  ADD_SCALAR_WRITER(double);
#undef ADD_SCALAR_WRITER

#define ADD_SCALAR(T)                                                   \
  .def("get_scalar_" #T, [](vs::Reader& self, const std::string& tag) { \
    auto tablet = self.tablet(tag);                                     \
    return vs::components::ScalarReader<T>(std::move(tablet));          \
  })
  py::class_<vs::Reader>(m, "Reader")
      .def(
          "__init__",
          [](vs::Reader& instance,
             const std::string& mode,
             const std::string& dir) { new (&instance) vs::Reader(mode, dir); })
      // clang-format off
    ADD_SCALAR(float)
    ADD_SCALAR(double)
    ADD_SCALAR(int)
// clang-format on
#undef ADD_SCALAR

#define ADD_SCALAR(T)                                                   \
  .def("new_scalar_" #T, [](vs::Writer& self, const std::string& tag) { \
    auto tablet = self.AddTablet(tag);                                  \
    return cp::Scalar<T>(tablet);                                       \
  })

  py::class_<vs::Writer>(m, "Writer")
      .def(
          "__init__",
          [](vs::Writer& instance,
             const std::string& mode,
             const std::string& dir) { new (&instance) vs::Writer(mode, dir); })
      // clang-format off
    ADD_SCALAR(float)
    ADD_SCALAR(double)
    ADD_SCALAR(int)
// clang-format on
#undef ADD_SCALAR

}  // end pybind
