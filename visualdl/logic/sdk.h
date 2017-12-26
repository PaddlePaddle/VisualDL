#ifndef VISUALDL_LOGIC_SDK_H
#define VISUALDL_LOGIC_SDK_H

#include "visualdl/storage/storage.h"
#include "visualdl/storage/tablet.h"
#include "visualdl/utils/string.h"
namespace visualdl {

const static std::string kDefaultMode{"default"};

class Writer {
public:
  Writer(const std::string& dir, int sync_cycle) {
    storage_.SetDir(dir);
    storage_.meta.cycle = sync_cycle;
  }
  Writer(const Writer& other) {
    storage_ = other.storage_;
    mode_ = other.mode_;
  }

  Writer AsMode(const std::string& mode) {
    Writer writer = *this;
    storage_.AddMode(mode);
    writer.mode_ = mode;
    return writer;
  }

  Tablet AddTablet(const std::string& tag) {
    // TODO(ChunweiYan) add string check here.
    auto tmp = mode_ + "/" + tag;
    string::TagEncode(tmp);
    auto res = storage_.AddTablet(tmp);
    res.SetCaptions(std::vector<std::string>({mode_}));
    res.SetTag(mode_, tag);
    return res;
  }

  Storage& storage() { return storage_; }

private:
  Storage storage_;
  std::string mode_{kDefaultMode};
};

class Reader {
public:
  Reader(const std::string& dir) : reader_(dir) {}

  Reader AsMode(const std::string& mode) {
    auto tmp = *this;
    tmp.mode_ = mode;
    return tmp;
  }

  const std::string& mode() { return mode_; }

  TabletReader tablet(const std::string& tag) {
    auto tmp = mode_ + "/" + tag;
    string::TagEncode(tmp);
    return reader_.tablet(tmp);
  }

  std::vector<std::string> all_tags() {
    auto tags = reader_.all_tags();
    auto it =
        std::remove_if(tags.begin(), tags.end(), [&](const std::string& tag) {
          return !TagMatchMode(tag, mode_);
        });
    tags.erase(it + 1);
    return tags;
  }

  std::vector<std::string> tags(const std::string& component) {
    auto type = Tablet::type(component);
    auto tags = reader_.tags(type);
    CHECK(!tags.empty());
    std::vector<std::string> res;
    for (const auto& tag : tags) {
      if (TagMatchMode(tag, mode_)) {
        res.push_back(GenReadableTag(mode_, tag));
      }
    }
    return res;
  }

  StorageReader& storage() { return reader_; }

  static std::string GenReadableTag(const std::string& mode,
                                    const std::string& tag) {
    auto tmp = tag;
    string::TagDecode(tmp);
    return tmp.substr(mode.size() + 1);  // including `/`
  }

  static bool TagMatchMode(const std::string& tag, const std::string& mode) {
    if (tag.size() <= mode.size()) return false;
    return tag.substr(0, mode.size()) == mode;
  }

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
    auto entry = record.AddData<T>();
    entry.Set(value);
  }

private:
  Tablet tablet_;
};

template <typename T>
struct ScalarReader {
  ScalarReader(TabletReader&& reader) : reader_(reader) {}

  std::vector<T> records() const;
  std::vector<T> ids() const;
  std::vector<T> timestamps() const;
  std::string caption() const;
  size_t total_records() { return reader_.total_records(); }
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

  Image(Tablet tablet, int num_samples) : writer_(tablet) {
    writer_.SetType(Tablet::Type::kImage);
    // make image's tag as the default caption.
    writer_.SetNumSamples(num_samples);
    SetCaption(tablet.reader().tag());
    num_samples_ = num_samples;
  }
  void SetCaption(const std::string& c) {
    writer_.SetCaptions(std::vector<std::string>({c}));
  }
  /*
   * Start a sample period.
   */
  void StartSampling();
  /*
   * Will this sample will be taken.
   */
  int IsSampleTaken();
  /*
   * End a sample period.
   */
  void FinishSampling();

  /*
   * Just store a tensor with nothing to do with image format.
   */
  void SetSample(int index,
                 const std::vector<shape_t>& shape,
                 const std::vector<value_t>& data);

private:
  Tablet writer_;
  Record step_;
  int num_records_{0};
  int num_samples_{0};
};

/*
 * Image reader.
 */
struct ImageReader {
  using value_t = typename Image::value_t;
  using shape_t = typename Image::shape_t;

  ImageReader(const std::string& mode, TabletReader tablet)
      : reader_(tablet), mode_{mode} {}

  std::string caption();

  // number of steps.
  int num_records() { return reader_.total_records(); }

  int num_samples() { return reader_.num_samples(); }

  int64_t timestamp(int step) { return reader_.record(step).timestamp(); }

  std::vector<value_t> data(int step, int index);

  std::vector<shape_t> shape(int step, int index);

private:
  TabletReader reader_;
  std::string mode_;
};

}  // namespace components
}  // namespace visualdl

#endif
