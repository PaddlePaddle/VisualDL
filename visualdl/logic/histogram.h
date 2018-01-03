#ifndef VISUALDL_LOGIC_HISTOGRAM_H
#define VISUALDL_LOGIC_HISTOGRAM_H

#include <limits>
#include <vector>

namespace visualdl {

// Create a histogram with default(10%) set of bucket boundaries.
// The buckets cover the range from min to max.
template <typename T>
struct HistogramBuilder {
  HistogramBuilder(int num_buckets) : num_buckets_(num_buckets) {}

  void operator()(T* begin, T* end) {
    begin_ = begin;
    end_ = end;
    CHECK_GE(end - begin, num_buckets_);
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
  void UpdateBoundary() {
    CHECK(begin_);
    CHECK(end_);
    for (T* s = begin_; s != end_; s++) {
      if (*s > right_boundary) right_boundary = *s;
      if (*s < left_boundary) left_boundary = *s;
    }
  }

  // Create `num_buckets` buckets.
  void CreateBuckets() {
    span_ = (float)right_boundary / num_buckets_ -
            (float)left_boundary / num_buckets_;
    buckets.resize(num_buckets_);
    for (auto* v = begin_; v != end_; v++) {
      int offset = int(*v / span_);
      buckets[offset]++;
    }
  }

  float span_;
  T* begin_{nullptr};
  T* end_{nullptr};
  int num_buckets_;
};

}  // namespace visualdl

#endif
