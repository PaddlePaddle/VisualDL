#include <ctype.h>
#include <pybind11/pybind11.h>

#include "visualdl/backend/logic/sdk.h"

namespace py = pybind11;
namespace vs = visualdl;

PYBIND11_MODULE(core, m) {
  m.doc() = "visualdl python core API";

  py::class_<vs::TabletHelper>(m, "Tablet")
      // interfaces for components
      .def("add_scalar_int32",
           &vs::TabletHelper::AddScalarRecord<int32_t>,
           "add a scalar int32 record",
           pybind11::arg("id"),
           pybind11::arg("value"))
      .def("add_scalar_int64",
           &vs::TabletHelper::AddScalarRecord<int64_t>,
           "add a scalar int64 record",
           pybind11::arg("id"),
           pybind11::arg("value"))
      .def("add_scalar_float", &vs::TabletHelper::AddScalarRecord<float>)
      .def("add_scalar_double", &vs::TabletHelper::AddScalarRecord<double>)
      // other member setter and getter
      .def("record_buffer", &vs::TabletHelper::record_buffer)
      .def("records_size", &vs::TabletHelper::records_size)
      .def("buffer", &vs::TabletHelper::buffer)
      .def("human_readable_buffer", &vs::TabletHelper::human_readable_buffer)
      .def("set_buffer",
           (void (vs::TabletHelper::*)(const std::string&)) &
               vs::TabletHelper::SetBuffer);

  py::class_<vs::StorageHelper>(m, "Storage")
      .def("timestamp", &vs::StorageHelper::timestamp)
      .def("dir", &vs::StorageHelper::dir)
      .def("set_dir", &vs::StorageHelper::SetDir)
      .def("tablets_size", &vs::StorageHelper::tablets_size)
      .def("buffer", &vs::StorageHelper::buffer)
      .def("human_readable_buffer", &vs::StorageHelper::human_readable_buffer)
      .def("set_buffer",
           (void (vs::StorageHelper::*)(const std::string&)) &
               vs::StorageHelper::SetBuffer);

  py::class_<vs::ImHelper>(m, "Im")
      .def("storage", &vs::ImHelper::storage)
      .def("tablet", &vs::ImHelper::tablet)
      .def("add_tablet", &vs::ImHelper::AddTablet);

  m.def("im", &vs::get_im, "global information-maintainer object.");
}
