/* Copyright (c) 2017 VisualDL Authors. All Rights Reserve.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

#include <ctype.h>
#include <pybind11/pybind11.h>
#include <pybind11/stl.h>

#include "visualdl/logic/sdk.h"

namespace py = pybind11;
namespace vs = visualdl;
namespace cp = visualdl::components;

#define ADD_FULL_TYPE_IMPL(CODE) \
  CODE(int32_t);                 \
  CODE(int64_t);                 \
  CODE(float);                   \
  CODE(double);

PYBIND11_MODULE(core, m) {
  m.doc() = "C++ core of VisualDL";

  py::class_<vs::LogReader>(m, "LogReader")
      .def(py::init(
          [](const std::string& dir) { return new vs::LogReader(dir); }))
      .def("as_mode", &vs::LogReader::AsMode)
      .def("set_mode", &vs::LogReader::SetMode)
      .def("modes", [](vs::LogReader& self) { return self.storage().modes(); })
      .def("tags", &vs::LogReader::tags)

// clang-format off
      #define READER_ADD_SCALAR(T)                                               \
      .def("get_scalar_" #T, [](vs::LogReader& self, const std::string& tag) { \
        auto tablet = self.tablet(tag);                                        \
        return vs::components::ScalarReader<T>(std::move(tablet));             \
      })
      READER_ADD_SCALAR(float)
      READER_ADD_SCALAR(double)
      READER_ADD_SCALAR(int)
      #undef READER_ADD_SCALAR

      #define READER_ADD_HISTOGRAM(T)                                            \
      .def("get_histogram_" #T, [](vs::LogReader& self, const std::string& tag) { \
          auto tablet = self.tablet(tag);                               \
          return vs::components::HistogramReader<T>(std::move(tablet));    \
        })
      READER_ADD_HISTOGRAM(float)
      READER_ADD_HISTOGRAM(double)
      READER_ADD_HISTOGRAM(int)
      #undef READER_ADD_HISTOGRAM

      // clang-format on
      .def("get_image", [](vs::LogReader& self, const std::string& tag) {
        auto tablet = self.tablet(tag);
        return vs::components::ImageReader(self.mode(), tablet);
      });

  // clang-format on
  py::class_<vs::LogWriter>(m, "LogWriter")
      .def(py::init([](const std::string& dir, int sync_cycle) {
        return new vs::LogWriter(dir, sync_cycle);
      }))
      .def("set_mode", &vs::LogWriter::SetMode)
      .def("as_mode", &vs::LogWriter::AsMode)
// clang-format off
      #define WRITER_ADD_SCALAR(T)                                               \
      .def("new_scalar_" #T, [](vs::LogWriter& self, const std::string& tag) { \
        auto tablet = self.AddTablet(tag);                                     \
        return cp::Scalar<T>(tablet);                                          \
      })
      #define WRITER_ADD_HISTOGRAM(T)                                           \
      .def("new_histogram_" #T,                                               \
          [](vs::LogWriter& self, const std::string& tag, int num_buckets) { \
            auto tablet = self.AddTablet(tag);                               \
            return cp::Histogram<T>(tablet, num_buckets);                    \
          })
      WRITER_ADD_SCALAR(float)
      WRITER_ADD_SCALAR(double)
      WRITER_ADD_SCALAR(int)
      WRITER_ADD_HISTOGRAM(float)
      WRITER_ADD_HISTOGRAM(double)
      WRITER_ADD_HISTOGRAM(int)
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
      .def("set_sample", &cp::Image::SetSample)
      .def("add_sample", &cp::Image::AddSample);

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

#define ADD_HISTOGRAM_WRITER(T)                           \
  py::class_<cp::Histogram<T>>(m, "HistogramWriter__" #T) \
      .def("add_record", &cp::Histogram<T>::AddRecord);
  ADD_FULL_TYPE_IMPL(ADD_HISTOGRAM_WRITER)
#undef ADD_HISTOGRAM_WRITER

#define ADD_HISTOGRAM_RECORD_INSTANCE(T)                                      \
  py::class_<vs::HistogramRecord<T>::Instance>(m, "HistogramInstance__" #T)   \
      .def("left",                                                            \
           [](typename vs::HistogramRecord<T>::Instance& self) {              \
             return self.left;                                                \
           })                                                                 \
      .def("right",                                                           \
           [](typename vs::HistogramRecord<T>::Instance& self) {              \
             return self.right;                                               \
           })                                                                 \
      .def("frequency", [](typename vs::HistogramRecord<T>::Instance& self) { \
        return self.frequency;                                                \
      });

  ADD_FULL_TYPE_IMPL(ADD_HISTOGRAM_RECORD_INSTANCE)
#undef ADD_HISTOGRAM_RECORD_INSTANCE

#define ADD_HISTOGRAM_RECORD(T)                                            \
  py::class_<vs::HistogramRecord<T>>(m, "HistogramRecord__" #T)            \
      .def("step", [](vs::HistogramRecord<T>& self) { return self.step; }) \
      .def("timestamp",                                                    \
           [](vs::HistogramRecord<T>& self) { return self.timestamp; })    \
      .def("instance", &vs::HistogramRecord<T>::instance)                  \
      .def("num_instances", &vs::HistogramRecord<T>::num_instances);
  ADD_FULL_TYPE_IMPL(ADD_HISTOGRAM_RECORD)
#undef ADD_HISTOGRAM_RECORD

#define ADD_HISTOGRAM_READER(T)                                 \
  py::class_<cp::HistogramReader<T>>(m, "HistogramReader__" #T) \
      .def("num_records", &cp::HistogramReader<T>::num_records) \
      .def("record", &cp::HistogramReader<T>::record);
  ADD_FULL_TYPE_IMPL(ADD_HISTOGRAM_READER)
#undef ADD_HISTOGRAM_READER

}  // end pybind
