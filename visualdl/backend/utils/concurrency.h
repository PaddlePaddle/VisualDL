#ifndef VISUALDL_BACKEND_UTILS_CONCURRENCY_H
#define VISUALDL_BACKEND_UTILS_CONCURRENCY_H

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
  using task_t = std::function<void()>;
  using duration_t = std::chrono::milliseconds;

  PeriodExector& Global() {
    static PeriodExector exec;
    return exec;
  }

  void Quit() {
    // TODO use some conditonal variable to help quit immediately.
    quit = true;
  }

  void operator()(task_t&& task, duration_t duration) {
    auto task_wrapper = [&, task] {
      while (!quit) {
        task();
        std::this_thread::sleep_for(duration);
      }
    };
    threads_.emplace_back(std::thread(std::move(task_wrapper)));
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
};

}  // namespace cc
}  // namespace visualdl

#endif
