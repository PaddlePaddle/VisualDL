#ifndef VISUALDL_LOGIC_HISTOGRAM_H
#define VISUALDL_LOGIC_HISTOGRAM_H

#include <glog/logging.h>
#include <cstdlib>
#include <limits>
#include <vector>

namespace visualdl {

// Create a histogram with default(10%) set of bucket boundaries.
// The buckets cover the range from min to max.
template <typename T>
struct HistogramBuilder {
  HistogramBuilder(int num_buckets) : num_buckets_(num_buckets) {}

  void operator()(const std::vector<T>& data) {
    CHECK_GE(data.size(), num_buckets_);

    UpdateBoundary(data);
    CreateBuckets(data);
  }

  T left_boundary{std::numeric_limits<T>::max()};
  T right_boundary{std::numeric_limits<T>::min()};
  std::vector<int> buckets;

  void Get(size_t n, T* left, T* right, int* frequency) {
    CHECK(!buckets.empty()) << "need to CreateBuckets first.";
    CHECK_LT(n, num_buckets_) << "n out of range.";
    *left = left_boundary + span_ * n;
    *right = *left + span_;
    *frequency = buckets[n];
  }

private:
  // Get the left and right boundaries.
  void UpdateBoundary(const std::vector<T>& data) {
    for (auto v : data) {
      if (v > right_boundary)
        right_boundary = v;
      else if (v < left_boundary)
        left_boundary = v;
    }
  }

  // Create `num_buckets` buckets.
  void CreateBuckets(const std::vector<T>& data) {
    span_ = (float)right_boundary / num_buckets_ -
            (float)left_boundary / num_buckets_;
    buckets.resize(num_buckets_);

    for (auto v : data) {
      int offset = std::min(int((v - left_boundary) / span_), num_buckets_ - 1);
      buckets[offset]++;
    }
  }

  float span_;
  int num_buckets_;
};

}  // namespace visualdl

#endif
