#ifndef VISUALDL_UTILS_CONCURRENCY_H
#define VISUALDL_UTILS_CONCURRENCY_H

#include <glog/logging.h>
#include <chrono>
#include <memory>
#include <thread>
#include <vector>

namespace visualdl {
namespace cc {

/*
 * Run a task every `duration` milliseconds.
 * Each evoke will start a thread to do this asynchronously.
 */
struct PeriodExector {
  using task_t = std::function<bool()>;

  static PeriodExector& Global() {
    static PeriodExector exec;
    return exec;
  }

  void Quit() {
    // TODO use some conditonal variable to help quit immediately.
    quit = true;
  }

  void Start() { quit = false; }

  void operator()(task_t&& task, int msec) {
    const int interval = 500;

    auto task_wrapper = [=] {
      while (!quit) {
        if (!task()) break;
        // if the program is terminated, quit while as soon as possible.
        // this is just trick, but should works.
        if (msec > 1000) {
          int i;
          for (i = 0; i < msec / interval; i++) {
            if (quit) break;
            std::this_thread::sleep_for(std::chrono::milliseconds(interval));
          }
          std::this_thread::sleep_for(
              std::chrono::milliseconds(msec - i * interval));
          if (quit) break;
        } else {
          std::this_thread::sleep_for(std::chrono::milliseconds(msec));
        }
      }
      LOG(INFO) << "quit concurrent job";
    };
    threads_.emplace_back(std::thread(std::move(task_wrapper)));
    msec_ = msec;
  }

  ~PeriodExector() {
    for (auto& t : threads_) {
      if (t.joinable()) {
        t.join();
      }
    }
  }

private:
  bool quit = false;
  std::vector<std::thread> threads_;
  int msec_;
};

}  // namespace cc
}  // namespace visualdl

#endif
