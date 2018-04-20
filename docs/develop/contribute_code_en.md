# How To Contribute

VisualDL is an open source project initiated by PaddlePaddle and ECharts.
Our goal is to break through the deep learning black box and help the developers to see the training trend by providing visualization.
We sincerely appreciate your contribution.  This document explains our workflow and work style.

## Workflow

VisualDL uses this [Git branching model](http://nvie.com/posts/a-successful-git-branching-model/).  The following steps guide usual contributions.

1. Fork

   To maintain the main repo and avoid dangling branches, please file Pull Requests from your fork. To make a fork, just head over to the GitHub page and click the ["Fork" button](https://help.github.com/articles/fork-a-repo/).

1. Clone

   To make a copy of your fork to your local computers, please run

   ```bash
   git clone https://github.com/your-github-account/VisualDL
   cd VisualDL
   ```

1. Create the local feature branch

   For daily works like adding a new feature or fixing a bug, please open your feature branch before coding:

   ```bash
   git checkout -b my-cool-stuff
   ```

1. Virtualenv

   VirtualEnv is an isolated virtual environment for Python. We highly recommend using `virtualenv` to keep your python environment clean.

   To create a virtual environment and activate it, please use the following commands.
   ```bash
   pip install --upgrade virtualenv
   virtualenv YOUR_VIRTUAL_EVN_FOLDER
   source YOUR_VIRTUAL_EVN_FOLDER/bin/activate
   ```

   When you are done with the work, you can deactivate the virtual environment by doing.
   ```bash
   deactivate
   ```

   To learn more about `virtualenv`, click [here](https://virtualenv.pypa.io/en/stable/)

1. Commit

   Before issuing your first `git commit` command, please install [`pre-commit`](http://pre-commit.com/) and other requirements by running the following commands:

   ```bash
   pip install -r requirements.txt
   pre-commit install
   ```

   Our pre-commit configuration requires [clang-format 3.8](http://releases.llvm.org/download.html) for auto-formating C/C++ code, yapf for auto-formating Python and flake8 for style checking Python.
   Please make sure clang-format version 3.8 is available in your path. For example, under ```/usr/local/bin```

    ```bash
    # For example, install clang-format on Mac

    tar xvfJ clang+llvm-3.8.0-x86_64-apple-darwin.tar.xz -C ./clang_mac_install/
    cd clang_mac_install/clang+llvm-3.8.0-x86_64-apple-darwin/bin/
    ln -s $(pwd)/$(find clang-format | grep bin/clang-format$) /usr/local/bin/clang-format

    # or directly mv clang-format binary to there
    # mv clang-format /usr/local/bin/

    ```

   Once installed, `pre-commit` checks the style of code and documentation in every commit.  We will see something like the following when you run `git commit`:

   ```
   git commit
   yapf.................................................(no files to check)Skipped
   Check for merge conflicts................................................Passed
   Check for broken symlinks................................................Passed
   Fix End of Files.........................................................Passed
   Trim Trailing Whitespace.................................................Passed
   Detect Private Key.......................................................Passed
   Check for broken symlinks................................................Passed
   Check for added large files..............................................Passed
   clang-format.........................................(no files to check)Skipped
   python-format-checker................................(no files to check)Skipped
   [my-cool-stuff c703c041] add test file
    1 file changed, 0 insertions(+), 0 deletions(-)
    create mode 100644 233
   ```

1. Build and test

   Users can build VisualDL natively on Linux and Mac OS X.

1. Keep pulling

   An experienced Git user pulls from the official repo often -- daily or even hourly, so they notice conflicts with others work early, and it's easier to resolve smaller conflicts.

   ```bash
   git remote add upstream https://github.com/PaddlePaddle/VisualDL
   git pull upstream develop
   ```

1. Push and file a pull request

   You can "push" your local work into your forked repo:

   ```bash
   git push origin my-cool-stuff
   ```

   The push allows you to create a pull request, requesting owners of this [official repo](https://github.com/PaddlePaddle/VisualDL) to pull your change into the official one.

   To create a pull request, please follow [these steps](https://help.github.com/articles/creating-a-pull-request/).

   If your change is for fixing an issue, please write ["Fixes <issue-URL>"](https://help.github.com/articles/closing-issues-using-keywords/) in the description section of your pull request.  Github would close the issue when the owners merge your pull request.

   Please remember to specify some reviewers for your pull request.  If you don't know who are the right ones, please follow Github's recommendation.


1. Delete local and remote branches

   To keep your local workspace and your fork clean, you might want to remove merged branches:

   ```bash
   git checkout develop
   git branch -d my-cool-stuff
   ```

### Code Review

-  Please feel free to ping your reviewers by sending them the URL of your pull request via IM or email.  Please do this after your pull request passes the CI.

- Please answer reviewers' every comment.  If you are to follow the comment, please write "Done"; please give a reason otherwise.

- If you don't want your reviewers to get overwhelmed by email notifications, you might reply their comments by [in a batch](https://help.github.com/articles/reviewing-proposed-changes-in-a-pull-request/).

- Reduce the unnecessary commits.  Some developers commit often.  It is recommended to append a sequence of small changes into one commit by running `git commit --amend` instead of `git commit`.


## Coding Standard

### Code Style

Our C/C++ code follows the [Google style guide](http://google.github.io/styleguide/cppguide.html).

Our Python code follows the [PEP8 style guide](https://www.python.org/dev/peps/pep-0008/).


Please install pre-commit, which automatically reformat the changes to C/C++ and Python code whenever we run `git commit`.  To check the whole codebase, we can run the command `pre-commit run -a`.

### Unit Tests

TBD
