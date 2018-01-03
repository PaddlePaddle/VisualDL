#ifndef VISUALDL_UTILS_IMAGE_H
#define VISUALDL_UTILS_IMAGE_H

#include <glog/logging.h>
#include <Eigen/Core>
#include <unsupported/Eigen/CXX11/Tensor>

namespace visualdl {

using uint8_t = unsigned char;

/*
 * 2: height*width, channel
 */
template <typename T>
using ImageDT =
    Eigen::Matrix<T, Eigen::Dynamic, Eigen::Dynamic, Eigen::RowMajor>;
using Uint8Image = ImageDT<uint8_t>;

/*
 * hw: height*width
 * depth: number of channels
 */
static void NormalizeImage(Uint8Image* image,
                           const float* buffer,
                           int hw,
                           int depth) {
  // Both image and buffer should be used in row major.
  Eigen::Map<const Eigen::
                 Matrix<float, Eigen::Dynamic, Eigen::Dynamic, Eigen::RowMajor>>
      values(buffer, depth, hw);

  CHECK_EQ(image->size(), hw * depth);
  CHECK_EQ(image->row(0).size(), hw);
  CHECK_EQ(image->col(0).size(), depth);

  std::vector<int> infinite_pixels;
  // compute min and max ignoring nonfinite pixels
  float image_min = std::numeric_limits<float>::infinity();
  float image_max = -image_min;
  for (int i = 0; i < hw; i++) {
    bool finite = true;
    for (int j = 0; j < depth; j++) {
      // if infinite, skip this pixel
      if (!std::isfinite(values(j, i))) {
        infinite_pixels.emplace_back(i);
        finite = false;
        break;
      }
    }
    if (finite) {
      for (int j = 0; j < depth; j++) {
        float v = values(j, i);
        image_min = std::min(image_min, v);
        image_max = std::max(image_max, v);
      }
    }
  }

  // Pick an affine transform into uint8
  const float kZeroThreshold = 1e-6;
  float scale, offset;
  if (image_min < 0) {
    float max_val = std::max(std::abs(image_min), image_max);
    scale = (max_val < kZeroThreshold ? 0.0f : 127.0f) / max_val;
  } else {
    scale = (image_max < kZeroThreshold ? 0.0f : 255.0f) / image_max;
    offset = 0.0f;
  }
  // Transform image, turning nonfinite values to bad_color
  for (int i = 0; i < depth; i++) {
    auto tmp = scale * values.row(i).array() + offset;
    image->row(i) = tmp.cast<uint8_t>();
  }

  for (int pixel : infinite_pixels) {
    for (int i = 0; i < depth; i++) {
      // TODO(ChunweiYan) use some highlight color to represent infinite pixels.
      (*image)(pixel, i) = (uint8_t)0;
    }
  }
}

}  // namespace visualdl

#endif
