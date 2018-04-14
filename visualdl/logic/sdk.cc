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

#include "visualdl/logic/sdk.h"

#include <cstdio>

#include "visualdl/logic/histogram.h"
#include "visualdl/storage/binary_record.h"
#include "visualdl/utils/image.h"
#include "visualdl/utils/logging.h"
#include "visualdl/utils/macro.h"

namespace visualdl {

// global log dir, a hack solution to pass accross all the components.
// One process of VDL backend can only process a single logdir, so this
// is OK.
std::string g_log_dir;

LogWriter LogWriter::AsMode(const std::string& mode) {
  for (auto ch : "%/") {
    CHECK(mode.find(ch) == std::string::npos)
        << "character " << ch
        << " is a reserved word, it is not allowed in mode.";
  }

  LogWriter writer = *this;
  storage_.AddMode(mode);
  writer.mode_ = mode;
  return writer;
}

Tablet LogWriter::AddTablet(const std::string& tag) {
  CHECK(tag.find("%") == std::string::npos)
      << "character % is a reserved word, it is not allowed in tag.";

  auto tmp = mode_ + "/" + tag;
  string::TagEncode(tmp);
  auto res = storage_.AddTablet(tmp);
  res.SetCaptions(std::vector<std::string>({mode_}));
  res.SetTag(mode_, tag);
  return res;
}

LogReader::LogReader(const std::string& dir) : reader_(dir) { g_log_dir = dir; }

LogReader LogReader::AsMode(const std::string& mode) {
  auto tmp = *this;
  tmp.mode_ = mode;
  return tmp;
}

TabletReader LogReader::tablet(const std::string& tag) {
  auto tmp = mode_ + "/" + tag;
  string::TagEncode(tmp);
  return reader_.tablet(tmp);
}

std::vector<std::string> LogReader::all_tags() {
  auto tags = reader_.all_tags();
  auto it =
      std::remove_if(tags.begin(), tags.end(), [&](const std::string& tag) {
        return !TagMatchMode(tag, mode_);
      });
  tags.erase(it + 1);
  return tags;
}

std::vector<std::string> LogReader::tags(const std::string& component) {
  auto type = Tablet::type(component);
  auto tags = reader_.tags(type);
  CHECK(!tags.empty()) << "component " << component << " has no taged records";
  std::vector<std::string> res;
  for (const auto& tag : tags) {
    if (TagMatchMode(tag, mode_)) {
      res.push_back(GenReadableTag(mode_, tag));
    }
  }
  return res;
}

std::string LogReader::GenReadableTag(const std::string& mode,
                                      const std::string& tag) {
  auto tmp = tag;
  string::TagDecode(tmp);
  return tmp.substr(mode.size() + 1);  // including `/`
}

bool LogReader::TagMatchMode(const std::string& tag, const std::string& mode) {
  if (tag.size() <= mode.size()) return false;
  return tag.substr(0, mode.size()) == mode &&
         (tag[mode.size()] == '/' || tag[mode.size()] == '%');
}

namespace components {

template <typename T>
std::vector<T> ScalarReader<T>::records() const {
  std::vector<T> res;
  for (int i = 0; i < total_records(); i++) {
    res.push_back(reader_.record(i).data(0).template Get<T>());
  }
  return res;
}

template <typename T>
std::vector<int> ScalarReader<T>::ids() const {
  std::vector<int> res;
  for (int i = 0; i < reader_.total_records(); i++) {
    res.push_back(reader_.record(i).id());
  }
  return res;
}

template <typename T>
std::vector<time_t> ScalarReader<T>::timestamps() const {
  std::vector<time_t> res;
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

int Image::IndexOfSampleTaken() {
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

void Image::AddSample(const std::vector<shape_t>& shape,
                      const std::vector<value_t>& data) {
  auto idx = IndexOfSampleTaken();
  if (idx >= 0) {
    SetSample(idx, shape, data);
  }
}

void Image::SetSample(int index,
                      const std::vector<shape_t>& shape,
                      const std::vector<value_t>& data) {
  std::vector<shape_t> new_shape = shape;
  if (shape.size() == 2) {
    new_shape.emplace_back(1);
  }
  // production
  int size =
      std::accumulate(new_shape.begin(), new_shape.end(), 1., [](int a, int b) {
        return a * b;
      });
  CHECK_GT(size, 0);
  CHECK_LE(new_shape.size(), 3)
      << "shape should be something like (width, height, num_channel)";
  CHECK_LE(new_shape.back(), 3);
  CHECK_GE(new_shape.back(), 1);
  CHECK_EQ(size, data.size()) << "image's shape not match data";
  CHECK_LT(index, num_samples_);
  CHECK_LE(index, num_records_);

  Uint8Image image(new_shape[2], new_shape[0] * new_shape[1]);
  NormalizeImage(&image, &data[0], new_shape[0] * new_shape[1], new_shape[2]);

  BinaryRecord brcd(
      GenBinaryRecordDir(step_.parent()->dir()),
      std::string(image.data(), image.data() + image.rows() * image.cols()));
  brcd.tofile();

  auto entry = step_.MutableData<std::vector<byte_t>>(index);
  // update record
  auto old_hash = entry.reader().GetRaw();
  if (!old_hash.empty()) {
    std::string old_path =
        GenBinaryRecordDir(step_.parent()->dir()) + "/" + old_hash;
    CHECK_EQ(std::remove(old_path.c_str()), 0) << "delete old binary record "
                                               << old_path << " failed";
  }
  entry.SetRaw(brcd.filename());

  static_assert(
      !is_same_type<value_t, shape_t>::value,
      "value_t should not use int64_t field, this type is used to store shape");

  // set meta.
  entry.SetMulti(new_shape);
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
  auto filename = entry.GetRaw();
  CHECK(!g_log_dir.empty())
      << "g_log_dir should be set in LogReader construction";
  BinaryRecordReader brcd(GenBinaryRecordDir(g_log_dir), filename);

  std::transform(brcd.data.begin(),
                 brcd.data.end(),
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
  CHECK_LT(i, num_records());
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

std::vector<std::string> TextReader::records() const {
  std::vector<std::string> res;
  for (int i = 0; i < total_records(); i++) {
    res.push_back(reader_.record(i).data(0).template Get<std::string>());
  }
  return res;
}

std::vector<int> TextReader::ids() const {
  std::vector<int> res;
  for (int i = 0; i < reader_.total_records(); i++) {
    res.push_back(reader_.record(i).id());
  }
  return res;
}

std::vector<time_t> TextReader::timestamps() const {
  std::vector<time_t> res;
  for (int i = 0; i < reader_.total_records(); i++) {
    res.push_back(reader_.record(i).timestamp());
  }
  return res;
}

std::string TextReader::caption() const {
  CHECK(!reader_.captions().empty()) << "no caption";
  return reader_.captions().front();
}

size_t TextReader::size() const { return reader_.total_records(); }

/*
 * Embedding functions
 */
void Embedding::AddEmbeddingsWithWordList(
    const std::vector<std::vector<float>>& word_embeddings,
    std::vector<std::string>& labels) {
  for (int i = 0; i < word_embeddings.size(); i++) {
    AddEmbedding(i, word_embeddings[i], labels[i]);
  }
}

void Embedding::AddEmbedding(int item_id,
                             const std::vector<float>& one_hot_vector,
                             std::string& label) {
  auto record = tablet_.AddRecord();
  record.SetId(item_id);
  time_t time = std::time(nullptr);
  record.SetTimeStamp(time);
  auto entry = record.AddData();
  entry.SetMulti<float>(one_hot_vector);
  entry.SetRaw(label);
}

/*
 * EmbeddingReader functions
 */
std::vector<std::string> EmbeddingReader::get_all_labels() const {
  std::vector<std::string> result;

  for (int i = 0; i < total_records(); i++) {
    auto record = reader_.record(i);
    auto entry = record.data(0);
    result.push_back(entry.GetRaw());
  }
  return result;
}

std::vector<std::vector<float>> EmbeddingReader::get_all_embeddings() const {
  std::vector<std::vector<float>> result;

  for (int i = 0; i < total_records(); i++) {
    auto record = reader_.record(i);
    auto entry = record.data(0);
    auto tensors = entry.GetMulti<float>();

    result.push_back(tensors);
  }
  return result;
}

std::vector<int> EmbeddingReader::ids() const {
  std::vector<int> res;
  for (int i = 0; i < reader_.total_records(); i++) {
    res.push_back(reader_.record(i).id());
  }
  return res;
}

std::vector<time_t> EmbeddingReader::timestamps() const {
  std::vector<time_t> res;
  for (int i = 0; i < reader_.total_records(); i++) {
    res.push_back(reader_.record(i).timestamp());
  }
  return res;
}

std::string EmbeddingReader::caption() const {
  CHECK(!reader_.captions().empty()) << "no caption";
  return reader_.captions().front();
}

size_t EmbeddingReader::size() const { return reader_.total_records(); }

void Audio::StartSampling() {
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

int Audio::IndexOfSampleTaken() {
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

void Audio::FinishSampling() {
  step_id_++;
  if (ToSampleThisStep()) {
    writer_.parent()->PersistToDisk();
  }
}

void Audio::AddSample(const std::vector<shape_t>& shape,
                      const std::vector<value_t>& data) {
  auto idx = IndexOfSampleTaken();
  if (idx >= 0) {
    SetSample(idx, shape, data);
  }
}

void Audio::SetSample(int index,
                      const std::vector<shape_t>& shape,
                      const std::vector<value_t>& data) {
  CHECK_EQ(shape.size(), 3)
      << "shape need to be (sample rate, sample width, num channel)";

  shape_t sample_rate = shape[0];
  shape_t sample_width = shape[1];
  shape_t num_channels = shape[2];

  CHECK_GT(sample_rate, 0) << "sample rate is number of frames per second, "
                              "should be something like 8000, 16000 or 44100";
  CHECK_GT(sample_width, 0)
      << "sample width is frame size in bytes, 16bits frame will be 2";
  CHECK_GT(num_channels, 0) << "num channel will be something like 1 or 2";
  CHECK_LT(index, num_samples_)
      << "index should be less than number of samples";
  CHECK_LE(index, num_records_)
      << "index should be less than or equal to number of records";

  // due to prototype limit size, we create a directory to log binary data such
  // as audio or image
  BinaryRecord brcd(
      GenBinaryRecordDir(step_.parent()->dir()),
      std::string(data.begin(),
                  data.end()));  // convert vector to binary string
  brcd.tofile();

  auto entry = step_.MutableData<std::vector<byte_t>>(index);
  // update record
  auto old_hash = entry.reader().GetRaw();
  if (!old_hash.empty()) {
    std::string old_path =
        GenBinaryRecordDir(step_.parent()->dir()) + "/" + old_hash;
    CHECK_EQ(std::remove(old_path.c_str()), 0) << "delete old binary record "
                                               << old_path << " failed";
  }
  entry.SetRaw(brcd.filename());
  entry.SetMulti(shape);
}

std::string AudioReader::caption() {
  CHECK_EQ(reader_.captions().size(), 1);
  auto caption = reader_.captions().front();
  if (LogReader::TagMatchMode(caption, mode_)) {
    return LogReader::GenReadableTag(mode_, caption);
  }
  string::TagDecode(caption);
  return caption;
}

AudioReader::AudioRecord AudioReader::record(int offset, int index) {
  AudioRecord res;
  auto record = reader_.record(offset);
  auto entry = record.data(index);
  auto filename = entry.GetRaw();
  CHECK(!g_log_dir.empty())
      << "g_log_dir should be set in LogReader construction";
  BinaryRecordReader brcd(GenBinaryRecordDir(g_log_dir), filename);

  // convert binary string back to vector of uint8_t, equivalent of python
  // numpy.fromstring(data, dtype='uint8')
  std::transform(brcd.data.begin(),
                 brcd.data.end(),
                 std::back_inserter(res.data),
                 [](byte_t i) { return (uint8_t)(i); });
  res.shape = entry.GetMulti<shape_t>();
  res.step_id = record.id();
  return res;
}

}  // namespace components

}  // namespace visualdl
