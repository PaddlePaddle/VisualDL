#ifndef VISUALDL_UTILS_LOGGING_H
#define VISUALDL_UTILS_LOGGING_H

#include <csignal>
#include <iostream>
#include <sstream>
#include <stdexcept>
#include <string>

#if defined(VISUALDL_WITH_GLOG)
#include <glog/logging.h>
#endif

namespace visualdl {
namespace logging {
#if !defined(VISUALDL_WITH_GLOG)

// basic log stream for INFO, ERROR, WARNING
struct LogStream {
  LogStream(const char* file, int line) : os_(std::cerr) {
    os_ << "[" << file << ":" << line << "] ";
  }

  ~LogStream() { os_ << "\n"; }

  std::ostream& stream() { return os_; }

  void operator=(const LogStream&) = delete;
  LogStream(const LogStream&) = delete;

private:
  std::ostream& os_;
};
#endif

#if !defined(VISUALDL_WITH_GLOG)
#if defined(VISUALDL_FATAL_ABORT)
// log stream for FATAL
struct LogStreamFatal : public LogStream {
  LogStreamFatal(const char* file, int line) : LogStream(file, line) {}
  ~LogStreamFatal() { abort(); }

  LogStreamFatal(const LogStreamFatal&) = delete;
  void operator=(const LogStreamFatal&) = delete;
};

#else

struct Error : public std::runtime_error {
  explicit Error(const std::string& s) : std::runtime_error(s) {}
};

// With exception.
struct LogStreamFatal {
  LogStreamFatal(const char* file, int line) {
    ss << "[" << file << ":" << line << "] ";
    throw Error(ss.str());
  }

  std::stringstream& stream() { return ss; }

  ~LogStreamFatal() {
    if (!has_throw_) {
      std::cerr << "throw exception" << std::endl;
      throw Error(ss.str());
    }
  }

private:
  bool has_throw_{false};
  mutable std::stringstream ss;
};

#endif  // VISUALDL_FATAL_ABORT
#endif  // VISUALDL_WITH_GLOG

#ifndef VISUALDL_WITH_GLOG

#define LOG(severity) LOG_##severity
#define LOG_INFO visualdl::logging::LogStream(__FILE__, __LINE__).stream()
#define LOG_WARNING LOG_INFO
#define LOG_ERROR LOG_INFO
#define LOG_FATAL visualdl::logging::LogStreamFatal(__FILE__, __LINE__).stream()
// basic version without support for debug level.
#define VLOG(x) LOG_INFO

#define CHECK(cond)                                              \
  if (!(cond))                                                   \
  visualdl::logging::LogStreamFatal(__FILE__, __LINE__).stream() \
      << "Check failed: " << #cond << " "
#define CHECK_EQ(v0, v1) CHECK_BINARY(v0, v1, ==)
#define CHECK_GE(v0, v1) CHECK_BINARY(v0, v1, >=)
#define CHECK_GT(v0, v1) CHECK_BINARY(v0, v1, >)
#define CHECK_LE(v0, v1) CHECK_BINARY(v0, v1, <=)
#define CHECK_LT(v0, v1) CHECK_BINARY(v0, v1, <)
#define CHECK_BINARY(v0, v1, op) \
  if (!(v0 op v1)) LOG_FATAL << " Check failed: " << v0 << #op << v1 << " "

#endif  // ifndef VISUALDL_WITH_GLOG

}  // namespace logging
}  // namespace visualdl

namespace visualdl {

namespace log {

class NotImplementedException : public std::logic_error {
public:
  NotImplementedException() : std::logic_error{"Function not implemented"} {}
};

}  // namespace log

}  // namespace visualdl

#endif
