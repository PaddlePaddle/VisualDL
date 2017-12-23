#include "visualdl/logic/sdk.h"

namespace visualdl {

namespace components {

// template <typename T>
// void components::Scalar<T>::AddRecord(int id, const std::vector<T> &values) {
//   // add record data
//   auto record = tablet_.AddRecord();
//   auto entry = record.AddData<T>();
//   for (auto v : values) {
//     entry.Add(v);
//   }
//   // set record id
//   record.SetId(id);
//   // set record timestamp
//   record.SetTimeStamp(time(NULL));
// }

// template <typename T>
// std::vector<T> ScalarReader<T>::records() const {
//   std::vector<T> res;
//   for (int i = 0; i < reader_.total_records(); i++) {
//     res.push_back(reader_.record(i).data<T>(0));
//   }
//   return res;
// }

// template <typename T>
// std::vector<int> ScalarReader<T>::ids() const {
//   std::vector<int> res;
//   for (int i = 0; i < reader_.total_records(); i++) {
//     res.push_back(reader_.record(i).id());
//   }
//   return res;
// }

// template <typename T>
// std::vector<int> ScalarReader<T>::timestamps() const {
//   std::vector<T> res;
//   for (int i = 0; i < reader_.total_records(); i++) {
//     res.push_back(reader_.record(i).timestamp());
//   }
//   return res;
// }

// template <typename T>
// std::vector<std::string> ScalarReader<T>::captions() const {
//   return reader_.captions();
// }

// template <typename T>
// size_t ScalarReader<T>::size() const {
//   return reader_.total_records();
// }

// template class Scalar<int>;
// template class Scalar<int64_t>;
// template class Scalar<float>;
// template class Scalar<double>;

}  // namespace components

}  // namespace visualdl
