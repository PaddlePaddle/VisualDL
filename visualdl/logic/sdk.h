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

#ifndef VISUALDL_LOGIC_SDK_H
#define VISUALDL_LOGIC_SDK_H

#include "visualdl/logic/histogram.h"
#include "visualdl/storage/storage.h"
#include "visualdl/storage/tablet.h"
#include "visualdl/utils/string.h"

namespace visualdl {

const static std::string kDefaultMode{"default"};

/**
 * LogWriter is common Data Structure used to write data
 * into a low level storage data structure.
 */
class LogWriter {
public:
  LogWriter(const std::string& dir, int sync_cycle) {
    storage_.SetDir(dir);
    storage_.meta.cycle = sync_cycle;
  }

  LogWriter(const LogWriter& other) {
    mode_ = other.mode_;
    storage_ = other.storage_;
  }

  void SetMode(const std::string& mode) {
    mode_ = mode;
    storage_.AddMode(mode);
  }
  void Save() { storage_.PersistToDisk(); }
  LogWriter AsMode(const std::string& mode);

  Tablet AddTablet(const std::string& tag);

  Storage& storage() { return storage_; }

private:
  Storage storage_;
  std::string mode_{kDefaultMode};
};

/**
 * LogReader is common Data Structure used to read data
 * from a low level storage data structure.
 */
class LogReader {
public:
  LogReader(const std::string& dir);

  void SetMode(const std::string& mode) { mode_ = mode; }

  LogReader AsMode(const std::string& mode);

  const std::string& mode() { return mode_; }

  TabletReader tablet(const std::string& tag);

  std::vector<std::string> all_tags();

  std::vector<std::string> tags(const std::string& component);

  StorageReader& storage() { return reader_; }

  static std::string GenReadableTag(const std::string& mode,
                                    const std::string& tag);

  static bool TagMatchMode(const std::string& tag, const std::string& mode);

protected:
private:
  StorageReader reader_;
  std::string mode_{kDefaultMode};
};

namespace components {

/*
 * Read and write support for Scalar component.
 */
template <typename T>
struct Scalar {
  Scalar(Tablet tablet) : tablet_(tablet) {
    tablet_.SetType(Tablet::Type::kScalar);
  }

  void SetCaption(const std::string cap) {
    tablet_.SetCaptions(std::vector<std::string>({cap}));
  }

  void AddRecord(int id, T value) {
    auto record = tablet_.AddRecord();
    record.SetId(id);
    auto entry = record.AddData();

    time_t time = std::time(nullptr);
    record.SetTimeStamp(time);
    entry.Set(value);
  }

private:
  Tablet tablet_;
};

template <typename T>
struct ScalarReader {
  ScalarReader(TabletReader&& reader) : reader_(reader) {}

  std::vector<T> records() const;
  std::vector<int> ids() const;
  std::vector<time_t> timestamps() const;
  std::string caption() const;
  size_t total_records() const { return reader_.total_records(); }
  size_t size() const;

private:
  TabletReader reader_;
};

/*
 * Image component writer.
 */
struct Image {
  using value_t = float;
  using shape_t = int64_t;

  /*
   * step_cycle: store every `step_cycle` as a record.
   * num_samples: how many samples to take in a step.
   */
  Image(Tablet tablet, int num_samples, int step_cycle)
      : writer_(tablet), num_samples_(num_samples), step_cycle_(step_cycle) {
    CHECK_GT(step_cycle, 0);
    CHECK_GT(num_samples, 0);

    writer_.SetType(Tablet::Type::kImage);
    // make image's tag as the default caption.
    writer_.SetNumSamples(num_samples);
    SetCaption(tablet.reader().tag());
  }

  void SetCaption(const std::string& c) {
    writer_.SetCaptions(std::vector<std::string>({c}));
  }

  /*
   * Start a sampling period, this interface will start a new reservior sampling
   * phase.
   */
  void StartSampling();
  /*
   * End a sampling period, it will clear all states for reservior sampling.
   */
  void FinishSampling();

  /*
   * A combined interface for IndexOfSampleTaken and SetSample, simpler but
   * might be
   * low efficiency.
   */
  void AddSample(const std::vector<shape_t>& shape,
                 const std::vector<value_t>& data);

  /*
   * Will this sample be taken, this interface is introduced to reduce the cost
   * of copy image data, by testing whether this image will be sampled, and only
   * copy data when it should be sampled. In that way, most of unsampled image
   * data need not be copied or processed at all.
   */
  int IndexOfSampleTaken();
  /*
   * Just store a tensor with nothing to do with image format.
   */
  void SetSample(int index,
                 const std::vector<shape_t>& shape,
                 const std::vector<value_t>& data);

protected:
  bool ToSampleThisStep() { return step_id_ % step_cycle_ == 0; }

private:
  Tablet writer_;
  Record step_;
  int num_records_{0};
  int num_samples_{0};
  int step_id_{0};
  int step_cycle_;
};

/*
 * Image reader.
 */
struct ImageReader {
  using value_t = typename Image::value_t;
  using shape_t = typename Image::shape_t;

  struct ImageRecord {
    int step_id;
    std::vector<int> data;
    std::vector<shape_t> shape;
  };

  ImageReader(const std::string& mode, TabletReader tablet)
      : reader_(tablet), mode_{mode} {}

  std::string caption();

  // number of steps.
  int num_records() { return reader_.total_records(); }

  int num_samples() { return reader_.num_samples(); }

  int64_t timestamp(int step) { return reader_.record(step).timestamp(); }

  /*
   * offset: offset of a step.
   * index: index of a sample.
   */
  ImageRecord record(int offset, int index);

  /*
   * offset: offset of a step.
   * index: index of a sample.
   */
  std::vector<value_t> data(int offset, int index);

  /*
   * offset: offset of a step.
   * index: index of a sample.
   */
  std::vector<shape_t> shape(int offset, int index);

  int stepid(int offset, int index);

private:
  TabletReader reader_;
  std::string mode_;
};

/*
 * Histogram component writer.
 */
template <typename T>
struct Histogram {
  Histogram(Tablet tablet, int num_buckets)
      : writer_(tablet), num_buckets_(num_buckets) {
    writer_.SetType(Tablet::Type::kHistogram);
  }

  void AddRecord(int step, const std::vector<T>& data);

private:
  int num_buckets_;
  Tablet writer_;
};

/*
 * Histogram reader.
 */
template <typename T>
struct HistogramReader {
  HistogramReader(TabletReader tablet) : reader_(tablet) {}

  size_t num_records() { return reader_.total_records() - 1; }

  HistogramRecord<T> record(int i);

private:
  TabletReader reader_;
};

/*
 * Text component writer
 */
struct Text {
  Text(Tablet tablet) : tablet_(tablet) {
    tablet_.SetType(Tablet::Type::kText);
  }
  void SetCaption(const std::string cap) {
    tablet_.SetCaptions(std::vector<std::string>({cap}));
  }

  void AddRecord(int id, std::string value) {
    auto record = tablet_.AddRecord();
    record.SetId(id);
    auto entry = record.AddData();

    time_t time = std::time(nullptr);
    record.SetTimeStamp(time);
    entry.Set(value);
  }

private:
  Tablet tablet_;
};

/*
 * Text reader.
 */
struct TextReader {
  TextReader(TabletReader reader) : reader_(reader) {}

  std::vector<std::string> records() const;
  std::vector<int> ids() const;
  std::vector<time_t> timestamps() const;
  std::string caption() const;
  size_t total_records() const { return reader_.total_records(); }
  size_t size() const;

private:
  TabletReader reader_;
};

/*
 * Embedding component writer
 */
struct Embedding {
  Embedding(Tablet tablet) : tablet_(tablet) {
    tablet_.SetType(Tablet::Type::kEmbedding);
  }
  void SetCaption(const std::string cap) {
    tablet_.SetCaptions(std::vector<std::string>({cap}));
  }

  // Add all word vectors along with all labels
  // The index of labels should match with the index of word_embeddings
  // EX: ["Apple", "Orange"] means the first item in word_embeddings represents
  // "Apple"
  void AddEmbeddingsWithWordList(
      const std::vector<std::vector<float>>& word_embeddings,
      std::vector<std::string>& labels);
  // TODO: Create another function that takes 'word_embeddings' and 'word_dict'
private:
  void AddEmbedding(int item_id,
                    const std::vector<float>& one_hot_vector,
                    std::string& label);

  Tablet tablet_;
};

/*
 * Embedding Reader.
 */
struct EmbeddingReader {
  EmbeddingReader(TabletReader reader) : reader_(reader) {}

  std::vector<int> ids() const;
  std::vector<std::string> get_all_labels() const;
  std::vector<std::vector<float>> get_all_embeddings() const;

  std::vector<time_t> timestamps() const;
  std::string caption() const;
  size_t total_records() const { return reader_.total_records(); }
  size_t size() const;

private:
  TabletReader reader_;
};

/*
 * Image component writer.
 */
struct Audio {
  using value_t = uint8_t;
  using shape_t = int32_t;

  /*
   * step_cycle: store every `step_cycle` as a record.
   * num_samples: how many samples to take in a step.
   */
  Audio(Tablet tablet, int num_samples, int step_cycle)
      : writer_(tablet), num_samples_(num_samples), step_cycle_(step_cycle) {
    CHECK_GT(step_cycle, 0);
    CHECK_GT(num_samples, 0);

    writer_.SetType(Tablet::Type::kAudio);
    // make audio's tag as the default caption.
    writer_.SetNumSamples(num_samples);
    SetCaption(tablet.reader().tag());
  }

  void SetCaption(const std::string& c) {
    writer_.SetCaptions(std::vector<std::string>({c}));
  }

  /*
   * Start a sampling period, this interface will start a new reservior sampling
   * phase.
   */
  void StartSampling();
  /*
   * End a sampling period, it will clear all states for reservior sampling.
   */
  void FinishSampling();

  /*
   * A combined interface for IndexOfSampleTaken and SetSample, simpler but
   * might be
   * low efficiency.
   */
  void AddSample(const std::vector<shape_t>& shape,
                 const std::vector<value_t>& data);

  /*
   * Will this sample be taken, this interface is introduced to reduce the cost
   * of copy audio data, by testing whether this audio will be sampled, and only
   * copy data when it should be sampled. In that way, most of unsampled audio
   * data need not be copied or processed at all.
   */
  int IndexOfSampleTaken();
  /*
   * Store audio data with sample rate
   */
  void SetSample(int index,
                 const std::vector<shape_t>& shape,
                 const std::vector<value_t>& data);

protected:
  bool ToSampleThisStep() { return step_id_ % step_cycle_ == 0; }

private:
  Tablet writer_;
  Record step_;
  int num_records_{0};
  int num_samples_{0};
  int step_id_{0};
  int step_cycle_;
};

/*
 * Audio reader.
 */
struct AudioReader {
  using value_t = typename Audio::value_t;
  using shape_t = typename Audio::shape_t;

  struct AudioRecord {
    int step_id;
    std::vector<uint8_t> data;
    std::vector<shape_t> shape;
  };

  AudioReader(const std::string& mode, TabletReader tablet)
      : reader_(tablet), mode_{mode} {}

  std::string caption();

  // number of steps.
  int num_records() { return reader_.total_records(); }

  int num_samples() { return reader_.num_samples(); }

  int64_t timestamp(int step) { return reader_.record(step).timestamp(); }

  /*
   * offset: offset of a step.
   * index: index of a sample.
   */
  AudioRecord record(int offset, int index);

  /*
   * offset: offset of a step.
   * index: index of a sample.
   */
  std::vector<value_t> data(int offset, int index);

  /*
   * offset: offset of a step.
   * index: index of a sample.
   */
  std::vector<shape_t> shape(int offset, int index);

  int stepid(int offset, int index);

private:
  TabletReader reader_;
  std::string mode_;
};

}  // namespace components
}  // namespace visualdl

#endif
