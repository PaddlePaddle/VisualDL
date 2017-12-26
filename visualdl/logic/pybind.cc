#include <ctype.h>
#include <pybind11/pybind11.h>
#include <pybind11/stl.h>

#include "visualdl/logic/sdk.h"

namespace py = pybind11;
namespace vs = visualdl;
namespace cp = visualdl::components;

PYBIND11_PLUGIN(core) {
  py::module m("core", "C++ core of VisualDL");

#define READER_ADD_SCALAR(T)                                            \
  .def("get_scalar_" #T, [](vs::Reader& self, const std::string& tag) { \
    auto tablet = self.tablet(tag);                                     \
    return vs::components::ScalarReader<T>(std::move(tablet));          \
  })
  py::class_<vs::Reader>(m, "Reader")
      .def("__init__",
           [](vs::Reader& instance, const std::string& dir) {
             new (&instance) vs::Reader(dir);
           })
      .def("as_mode", &vs::Reader::AsMode)
      .def("modes", [](vs::Reader& self) { return self.storage().modes(); })
      .def("tags", &vs::Reader::tags)
      // clang-format off
      READER_ADD_SCALAR(float)
      READER_ADD_SCALAR(double)
      READER_ADD_SCALAR(int)
      // clang-format on
      .def("get_image", [](vs::Reader& self, const std::string& tag) {
        auto tablet = self.tablet(tag);
        return vs::components::ImageReader(self.mode(), tablet);
      });
#undef READER_ADD_SCALAR

#define WRITER_ADD_SCALAR(T)                                            \
  .def("new_scalar_" #T, [](vs::Writer& self, const std::string& tag) { \
    auto tablet = self.AddTablet(tag);                                  \
    return cp::Scalar<T>(tablet);                                       \
  })

  py::class_<vs::Writer>(m, "Writer")
      .def("__init__",
           [](vs::Writer& instance, const std::string& dir, int sync_cycle) {
             new (&instance) vs::Writer(dir, sync_cycle);
           })
      .def("as_mode", &vs::Writer::AsMode)
      // clang-format off
      WRITER_ADD_SCALAR(float)
      WRITER_ADD_SCALAR(double)
      WRITER_ADD_SCALAR(int)
      // clang-format on
      .def("new_image",
           [](vs::Writer& self, const std::string& tag, int num_samples) {
             auto tablet = self.AddTablet(tag);
             return vs::components::Image(tablet, num_samples);
           });

//------------------- components --------------------
#define ADD_SCALAR_READER(T)                               \
  py::class_<cp::ScalarReader<T>>(m, "ScalarReader__" #T)  \
      .def("records", &cp::ScalarReader<T>::records)       \
      .def("timestamps", &cp::ScalarReader<T>::timestamps) \
      .def("ids", &cp::ScalarReader<T>::ids)               \
      .def("caption", &cp::ScalarReader<T>::caption);
  ADD_SCALAR_READER(int);
  ADD_SCALAR_READER(float);
  ADD_SCALAR_READER(double);
  ADD_SCALAR_READER(int64_t);
#undef ADD_SCALAR_READER

#define ADD_SCALAR_WRITER(T)                          \
  py::class_<cp::Scalar<T>>(m, "ScalarWriter__" #T)   \
      .def("set_caption", &cp::Scalar<T>::SetCaption) \
      .def("add_record", &cp::Scalar<T>::AddRecord);
  ADD_SCALAR_WRITER(int);
  ADD_SCALAR_WRITER(float);
  ADD_SCALAR_WRITER(double);
#undef ADD_SCALAR_WRITER

  // clang-format on
  py::class_<cp::Image>(m, "ImageWriter")
      .def("set_caption", &cp::Image::SetCaption)
      .def("start_sampling", &cp::Image::StartSampling)
      .def("is_sample_taken", &cp::Image::IsSampleTaken)
      .def("finish_sampling", &cp::Image::FinishSampling)
      .def("set_sample", &cp::Image::SetSample);

  py::class_<cp::ImageReader>(m, "ImageReader")
      .def("caption", &cp::ImageReader::caption)
      .def("num_records", &cp::ImageReader::num_records)
      .def("num_samples", &cp::ImageReader::num_samples)
      .def("timestamp", &cp::ImageReader::timestamp)
      .def("data", &cp::ImageReader::data)
      .def("shape", &cp::ImageReader::shape);

}  // end pybind
