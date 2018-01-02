#include <ctype.h>
#include <pybind11/pybind11.h>
#include <pybind11/stl.h>

#include "visualdl/logic/sdk.h"

namespace py = pybind11;
namespace vs = visualdl;
namespace cp = visualdl::components;

PYBIND11_PLUGIN(core) {
  py::module m("core", "C++ core of VisualDL");

#define READER_ADD_SCALAR(T)                                               \
  .def("get_scalar_" #T, [](vs::LogReader& self, const std::string& tag) { \
    auto tablet = self.tablet(tag);                                        \
    return vs::components::ScalarReader<T>(std::move(tablet));             \
  })
  py::class_<vs::LogReader>(m, "LogReader")
      .def("__init__",
           [](vs::LogReader& instance, const std::string& dir) {
             new (&instance) vs::LogReader(dir);
           })
      .def("as_mode", &vs::LogReader::AsMode)
      .def("set_mode", &vs::LogReader::SetMode)
      .def("modes", [](vs::LogReader& self) { return self.storage().modes(); })
      .def("tags", &vs::LogReader::tags)
      // clang-format off
      READER_ADD_SCALAR(float)
      READER_ADD_SCALAR(double)
      READER_ADD_SCALAR(int)
      // clang-format on
      .def("get_image", [](vs::LogReader& self, const std::string& tag) {
        auto tablet = self.tablet(tag);
        return vs::components::ImageReader(self.mode(), tablet);
      });
#undef READER_ADD_SCALAR

#define WRITER_ADD_SCALAR(T)                                               \
  .def("new_scalar_" #T, [](vs::LogWriter& self, const std::string& tag) { \
    auto tablet = self.AddTablet(tag);                                     \
    return cp::Scalar<T>(tablet);                                          \
  })

  py::class_<vs::LogWriter>(m, "LogWriter")
      .def("__init__",
           [](vs::LogWriter& instance, const std::string& dir, int sync_cycle) {
             new (&instance) vs::LogWriter(dir, sync_cycle);
           })
      .def("set_mode", &vs::LogWriter::SetMode)
      .def("as_mode", &vs::LogWriter::AsMode)
      // clang-format off
      WRITER_ADD_SCALAR(float)
      WRITER_ADD_SCALAR(double)
      WRITER_ADD_SCALAR(int)
      // clang-format on
      .def("new_image",
           [](vs::LogWriter& self,
              const std::string& tag,
              int num_samples,
              int step_cycle) {
             auto tablet = self.AddTablet(tag);
             return vs::components::Image(tablet, num_samples, step_cycle);
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

  py::class_<cp::ImageReader::ImageRecord>(m, "ImageRecord")
      // TODO(ChunweiYan) make these copyless.
      .def("data", [](cp::ImageReader::ImageRecord& self) { return self.data; })
      .def("shape",
           [](cp::ImageReader::ImageRecord& self) { return self.shape; })
      .def("step_id",
           [](cp::ImageReader::ImageRecord& self) { return self.step_id; });

  py::class_<cp::ImageReader>(m, "ImageReader")
      .def("caption", &cp::ImageReader::caption)
      .def("num_records", &cp::ImageReader::num_records)
      .def("num_samples", &cp::ImageReader::num_samples)
      .def("record", &cp::ImageReader::record)
      .def("timestamp", &cp::ImageReader::timestamp);

  // .def("data", &cp::ImageReader::data)
  // .def("shape", &cp::ImageReader::shape);

}  // end pybind
