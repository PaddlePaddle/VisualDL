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

#ifndef VISUALDL_LOGIC_HISTOGRAM_H
#define VISUALDL_LOGIC_HISTOGRAM_H

#include <cstdlib>
#include <limits>
#include <vector>
#include "visualdl/utils/logging.h"

namespace visualdl {

// An interface to retrieve records of a histogram.
template <typename T>
struct HistogramRecord {
  struct Instance {
    T left;
    T right;
    int32_t frequency;
  };

  uint64_t timestamp;
  int step;

  HistogramRecord(uint64_t timestamp,
                  int step,
                  T left,
                  T right,
                  std::vector<int32_t>&& frequency)
      : timestamp(timestamp),
        step(step),
        left(left),
        right(right),
        frequency(frequency),
        span_(float(right - left) / frequency.size()) {}

  Instance instance(int i) const {
    CHECK_LT(i, frequency.size());
    Instance res;
    res.left = left + span_ * i;
    res.right = res.left + span_;
    res.frequency = frequency[i];
    return res;
  }

  size_t num_instances() const { return frequency.size(); }

private:
  T span_;
  T left;
  T right;
  std::vector<int32_t> frequency;
};

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

    // Go through the data, increase the item count in a bucket.
    for (auto v : data) {
      int bucket_group_index =
          std::min(int((v - left_boundary) / span_), num_buckets_ - 1);
      buckets[bucket_group_index]++;
    }
  }

  float span_;
  int num_buckets_;
};

}  // namespace visualdl

#endif
