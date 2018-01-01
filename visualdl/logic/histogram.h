#ifndef VISUALDL_LOGIC_HISTOGRAM_H
#define VISUALDL_LOGIC_HISTOGRAM_H

#include <limits>
#include <vector>

namespace visualdl {

// Create a histogram with default(10%) set of bucket boundaries.
// The buckets cover the range from min to max.
template <typename T>
struct HistogramBuilder {
  HistogramBuilder(T* begin, T* end, int num_buckets)
      : begin_(begin), end_(end), num_buckets_(num_buckets) {
        CHECK_GE(end - begin, num_buckets);
      }

  void operator()() {}

  T left_boundary{std::numeric_limits<T>::max()};
  T right_boundary{std::numeric_limits<T>::min()};
  std::vector<int> buckets;

private:
  // Get the left and right boundaries.
  void UpdateBoundary() {
    CHECK(begin_);
    CHECK(end_);
    for (T* s = begin_; s!=end_; s++) {
      if (*s > max_) max_ = *s;
      if (*s < min_) min_ = *s;
    }
  }

  // Create `num_buckets` buckets.
  void CreateBuckets() {
    float span = max_ / num_buckets - min_ / num_buckets;

    for (int i = 0; i < num_buckets_; i++) {
    }
  }

  T* begin_{nullptr};
  T* end_{nullptr};
  int num_buckets_;
};

}  // namespace visualdl

#endif
