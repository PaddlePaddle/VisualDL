#include "visualdl/logic/sdk.h"

#include "visualdl/logic/histogram.h"
#include "visualdl/utils/image.h"
#include "visualdl/utils/macro.h"

namespace visualdl {

namespace components {

template <typename T>
std::vector<T> ScalarReader<T>::records() const {
  std::vector<T> res;
  for (int i = 0; i < reader_.total_records(); i++) {
    res.push_back(reader_.record(i).data(0).template Get<T>());
  }
  return res;
}

template <typename T>
std::vector<T> ScalarReader<T>::ids() const {
  std::vector<T> res;
  for (int i = 0; i < reader_.total_records(); i++) {
    res.push_back(reader_.record(i).id());
  }
  return res;
}

template <typename T>
std::vector<T> ScalarReader<T>::timestamps() const {
  std::vector<T> res;
  for (int i = 0; i < reader_.total_records(); i++) {
    res.push_back(reader_.record(i).timestamp());
  }
  return res;
}

template <typename T>
std::string ScalarReader<T>::caption() const {
  CHECK(!reader_.captions().empty()) << "no caption";
  return reader_.captions().front();
}

template <typename T>
size_t ScalarReader<T>::size() const {
  return reader_.total_records();
}

void Image::StartSampling() {
  if (!ToSampleThisStep()) return;

  step_ = writer_.AddRecord();
  step_.SetId(step_id_);

  time_t time = std::time(nullptr);
  step_.SetTimeStamp(time);

  // resize record
  for (int i = 0; i < num_samples_; i++) {
    step_.AddData();
  }
  num_records_ = 0;
}

int Image::IsSampleTaken() {
  if (!ToSampleThisStep()) return -1;
  num_records_++;
  if (num_records_ <= num_samples_) {
    return num_records_ - 1;
  }
  float prob = float(num_samples_) / num_records_;
  float randv = (float)rand() / RAND_MAX;
  if (randv < prob) {
    // take this sample
    int index = rand() % num_samples_;
    return index;
  }
  return -1;
}

void Image::FinishSampling() {
  step_id_++;
  if (ToSampleThisStep()) {
    // TODO(ChunweiYan) much optimizement here.
    writer_.parent()->PersistToDisk();
  }
}

template <typename T, typename U>
struct is_same_type {
  static const bool value = false;
};
template <typename T>
struct is_same_type<T, T> {
  static const bool value = true;
};

void Image::SetSample(int index,
                      const std::vector<shape_t>& shape,
                      const std::vector<value_t>& data) {
  std::vector<shape_t> new_shape = shape;
  if (shape.size() == 2) {
    new_shape.emplace_back(1);
  }
  // production
  int size = std::accumulate(
          new_shape.begin(), new_shape.end(), 1., [](int a, int b) { return a * b; });
  CHECK_GT(size, 0);
  CHECK_LE(new_shape.size(), 3)
      << "shape should be something like (width, height, num_channel)";
  CHECK_LE(new_shape.back(), 3);
  CHECK_GE(new_shape.back(), 1);
  CHECK_EQ(size, data.size()) << "image's shape not match data";
  CHECK_LT(index, num_samples_);
  CHECK_LE(index, num_records_);

  auto entry = step_.MutableData<std::vector<byte_t>>(index);
  // trick to store int8 to protobuf
  std::vector<byte_t> data_str(data.size());
  for (int i = 0; i < data.size(); i++) {
    data_str[i] = data[i];
  }
  Uint8Image image(new_shape[2], new_shape[0] * new_shape[1]);
  NormalizeImage(&image, &data[0], new_shape[0] * new_shape[1], new_shape[2]);
  // entry.SetRaw(std::string(data_str.begin(), data_str.end()));
  entry.SetRaw(
      std::string(image.data(), image.data() + image.rows() * image.cols()));

  static_assert(
      !is_same_type<value_t, shape_t>::value,
      "value_t should not use int64_t field, this type is used to store shape");

  // set meta.
  entry.SetMulti(new_shape);

  // // set meta with hack
  // Entry<shape_t> meta;
  // meta.set_parent(entry.parent());
  // meta.entry = entry.entry;
  // meta.SetMulti(shape);
}

std::string ImageReader::caption() {
  CHECK_EQ(reader_.captions().size(), 1);
  auto caption = reader_.captions().front();
  if (LogReader::TagMatchMode(caption, mode_)) {
    return LogReader::GenReadableTag(mode_, caption);
  }
  string::TagDecode(caption);
  return caption;
}

ImageReader::ImageRecord ImageReader::record(int offset, int index) {
  ImageRecord res;
  auto record = reader_.record(offset);
  auto entry = record.data(index);
  auto data_str = entry.GetRaw();
  std::transform(data_str.begin(),
                 data_str.end(),
                 std::back_inserter(res.data),
                 [](byte_t i) { return (int)(i); });
  res.shape = entry.GetMulti<shape_t>();
  res.step_id = record.id();
  return res;
}

template <typename T>
void Histogram<T>::AddRecord(int step, const std::vector<T>& data) {
  HistogramBuilder<T> builder(num_buckets_);
  builder(data);

  auto record = writer_.AddRecord();
  record.SetId(step);
  time_t time = std::time(nullptr);
  record.SetTimeStamp(time);
  // set frequencies.
  auto entry = record.AddData();
  entry.template SetMulti<int32_t>(builder.buckets);
  // Serialize left and right boundaries.
  std::string boundaries_str = std::to_string(builder.left_boundary) + " " +
                               std::to_string(builder.right_boundary);
  entry.SetRaw(boundaries_str);
}

template <typename T>
HistogramRecord<T> HistogramReader<T>::record(int i) {
  CHECK_LT(i, reader_.total_records());
  auto r = reader_.record(i);
  auto d = r.data(0);
  auto boundaries_str = d.GetRaw();
  std::stringstream ss(boundaries_str);
  T left, right;
  ss >> left >> right;

  auto frequency = d.template GetMulti<int32_t>();
  auto timestamp = r.timestamp();
  auto step = r.id();

  return HistogramRecord<T>(timestamp, step, left, right, std::move(frequency));
}

DECL_BASIC_TYPES_CLASS_IMPL(class, ScalarReader)
DECL_BASIC_TYPES_CLASS_IMPL(struct, Histogram)
DECL_BASIC_TYPES_CLASS_IMPL(struct, HistogramReader)

}  // namespace components

}  // namespace visualdl
