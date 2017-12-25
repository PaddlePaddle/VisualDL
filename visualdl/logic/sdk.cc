#include "visualdl/logic/sdk.h"

namespace visualdl {

namespace components {

template <typename T>
std::vector<T> ScalarReader<T>::records() const {
  std::vector<T> res;
  for (int i = 0; i < reader_.total_records(); i++) {
    res.push_back(reader_.record(i).data<T>(0).Get());
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

template class ScalarReader<int>;
template class ScalarReader<int64_t>;
template class ScalarReader<float>;
template class ScalarReader<double>;

void Image::StartSampling() {
  step_ = writer_.AddRecord();
  num_records_ = 0;
}

int Image::IsSampleTaken() {
  num_records_++;
  if (num_records_ <= num_samples_) {
    return num_records_ - 1;
  }
  float prob = float(num_samples_) / num_records_;
  float thre = (float)rand() / RAND_MAX;
  if (prob < thre) {
    // take this sample
    int index = rand() % num_samples_;
    return index;
  }
  return -1;
}

void Image::FinishSampling() {
  // TODO(ChunweiYan) much optimizement here.
  writer_.parent()->PersistToDisk();
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
                      const std::vector<int64_t>& shape,
                      const std::vector<value_t>& data) {
  // production
  int size = std::accumulate(
      shape.begin(), shape.end(), 1., [](float a, float b) { return a * b; });
  CHECK_EQ(size, data.size()) << "image's shape not match data";
  CHECK_LT(index, num_samples_);
  CHECK_LE(index, num_records_);

  // set data
  Entry<value_t> entry;
  if (index == num_records_) {
    // add one entry
    entry = step_.AddData<value_t>();
  } else {
    entry = step_.MutableData<value_t>(index);
  }
  entry.SetMulti(data);

  static_assert(
      !is_same_type<value_t, int64_t>::value,
      "value_t should not use int64_t field, this type is used to store shape");

  // set meta with hack
  Entry<int64_t> meta;
  meta.set_parent(entry.parent());
  meta.entry = entry.entry;
  meta.SetMulti(shape);
}

}  // namespace components

}  // namespace visualdl
