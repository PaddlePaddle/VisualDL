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
    wrapped.method("set_caption", &WrappedT::SetCaption);
    wrapped.method("add_record", &WrappedT::AddRecord);
  }
};

struct WrapHistogram {
  template <typename TypeWrapperT>
  void operator()(TypeWrapperT&& wrapped) {
    typedef typename TypeWrapperT::type WrappedT;
    typedef typename WrappedT::data_type T;
    wrapped.template constructor<vs::Tablet, int>();
    wrapped.method("add_record",
                   [](WrappedT h, int step, jlcxx::ArrayRef<T, 1> data) {
                     std::vector<T> d(data.begin(), data.end());
                     return h.AddRecord(step, d);
                   });
  }
};

JLCXX_MODULE define_julia_module(jlcxx::Module& vdl) {
  vdl.add_type<vs::Tablet>("Tablet");
  vdl.add_type<vs::TabletReader>("TabletReader");
  vdl.add_type<vs::Storage>("Storage");
  vdl.add_type<vs::StorageReader>("StorageReader");

  vdl.add_type<vs::LogWriter>("LogWriter")
      .constructor<const std::string&, int>()
      .constructor<const vs::LogWriter&>()
      .method("set_mode", &vs::LogWriter::SetMode)
      .method("save", &vs::LogWriter::Save)
      .method("as_mode", &vs::LogWriter::AsMode)
      .method("add_tablet", &vs::LogWriter::AddTablet)
      .method("storage", &vs::LogWriter::storage);

  vdl.add_type<vs::LogReader>("LogReader")
      .constructor<const std::string&>()
      .method("set_mode", &vs::LogReader::SetMode)
      .method("as_mode", &vs::LogReader::AsMode)
      .method("mode", &vs::LogReader::mode)
      .method("tablet", &vs::LogReader::tablet)
      .method("storage", &vs::LogReader::storage)
      .method("alltags",
              [](vs::LogReader& lr) {
                auto alltags = lr.all_tags();
                return jlcxx::ArrayRef<std::string, 1>(alltags.data(),
                                                       alltags.size());
              })
      .method("tags", [](vs::LogReader& lr, const std::string& x) {
        auto tags = lr.tags(x);
        return jlcxx::ArrayRef<std::string, 1>(tags.data(), tags.size());
      });

  // components
  vdl.add_type<jlcxx::Parametric<jlcxx::TypeVar<1>>>("Scalar")
      .apply<cp::Scalar<float>,
             cp::Scalar<double>,
             cp::Scalar<int>,
             cp::Scalar<long>>(WrapScalar());

  vdl.add_type<jlcxx::Parametric<jlcxx::TypeVar<1>>>("Histogram")
      .apply<cp::Histogram<float>,
             cp::Histogram<double>,
             cp::Histogram<int>,
             cp::Histogram<long>>(WrapHistogram());

  vdl.add_type<cp::Image>("Image")
      .constructor<vs::Tablet, int, int>()
      .method("set_caption", &cp::Image::SetCaption)
      .method("start_sampling", &cp::Image::StartSampling)
      .method("finish_sampling", &cp::Image::FinishSampling)
      .method("add_sample",
              [](cp::Image& img,
                 jlcxx::ArrayRef<cp::Image::shape_t, 1> shape,
                 jlcxx::ArrayRef<cp::Image::value_t, 1> data) {
                std::vector<cp::Image::shape_t> s(shape.begin(), shape.end());
                std::vector<cp::Image::value_t> d(data.begin(), data.end());
                return img.AddSample(s, d);
              })
      .method("index_of_sample_taken", &cp::Image::IndexOfSampleTaken)
      .method("set_sample",
              [](cp::Image& img,
                 int index,
                 jlcxx::ArrayRef<cp::Image::shape_t, 1> shape,
                 jlcxx::ArrayRef<cp::Image::value_t, 1> data) {
                std::vector<cp::Image::shape_t> s(shape.begin(), shape.end());
                std::vector<cp::Image::value_t> d(data.begin(), data.end());
                return img.SetSample(index, s, d);
              });

  vdl.add_type<cp::Text>("Text")
      .constructor<vs::Tablet>()
      .method("set_caption", &cp::Text::SetCaption)
      .method("add_record", &cp::Text::AddRecord);

  vdl.add_type<cp::Audio>("Audio")
      .constructor<vs::Tablet, int, int>()
      .method("set_caption", &cp::Audio::SetCaption)
      .method("start_sampling", &cp::Audio::StartSampling)
      .method("finish_sampling", &cp::Audio::FinishSampling)
      .method("add_sample",
              [](cp::Audio& img,
                 jlcxx::ArrayRef<cp::Audio::shape_t, 1> shape,
                 jlcxx::ArrayRef<cp::Audio::value_t, 1> data) {
                std::vector<cp::Audio::shape_t> s(shape.begin(), shape.end());
                std::vector<cp::Audio::value_t> d(data.begin(), data.end());
                return img.AddSample(s, d);
              })
      .method("index_of_sample_taken", &cp::Audio::IndexOfSampleTaken)
      .method("set_sample",
              [](cp::Audio& img,
                 int index,
                 jlcxx::ArrayRef<cp::Audio::shape_t, 1> shape,
                 jlcxx::ArrayRef<cp::Audio::value_t, 1> data) {
                std::vector<cp::Audio::shape_t> s(shape.begin(), shape.end());
                std::vector<cp::Audio::value_t> d(data.begin(), data.end());
                return img.SetSample(index, s, d);
              });
}
