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

#ifndef VISUALDL_UTILS_CONCURRENCY_H
#define VISUALDL_UTILS_CONCURRENCY_H

#include <chrono>
#include <memory>
#include <thread>
#include <vector>
#include "visualdl/utils/logging.h"

namespace visualdl {
namespace cc {

/*
 * Run a task every `duration` milliseconds.
 * Each evoke will start a thread to do this asynchronously.
 */
struct PeriodExector {
  using task_t = std::function<bool()>;

  void Quit() {
    // TODO use some conditonal variable to help quit immediately.
    // std::this_thread::sleep_for(std::chrono::milliseconds(200));
    quit = true;
  }

  void Start() { quit = false; }

  void operator()(task_t&& task, int msec) {
    const int interval = 500;

    auto task_wrapper = [=] {
      while (!quit) {
        // task failed
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
    Quit();
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
