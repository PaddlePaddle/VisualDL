# 如何贡献代码

我们真诚地感谢您的贡献，欢迎通过 GitHub 的 fork 和 pull request 流程来提交代码。

## 教程
VisualDL 目前使用[Git流分支模型](http://nvie.com/posts/a-successful-git-branching-model/)进行开发，测试，发行和维护，以下教程将指导您提交代码。


1. Fork

    跳转到[VisualDL](https://github.com/PaddlePaddle/VisualDL) GitHub首页，然后单击 [Fork](https://help.github.com/articles/fork-a-repo/) 按钮，生成自己目录下的仓库，比如 <https://github.com/USERNAME/VisualDL>。

1. 克隆（Clone）

    将远程仓库 clone 到本地：

   ```bash
   git clone https://github.com/your-github-account/VisualDL
   cd VisualDL
   ```
1. 创建本地分支

    所有的 feature 和 bug fix 的开发工作都应该在一个新的分支上完成，一般从 `develop` 分支上创建新分支。

    使用 `git checkout -b` 创建并切换到新分支。

   ```bash
   git checkout -b my-cool-stuff
   ```
1. Virtualenv

   virtualenv是一个独立的Python虚拟环境。我们强烈建议您使用` virtualenv `来保持你的Python环境清洁。
   要创建虚拟环境并激活它，请使用以下命令。

   ```bash
   pip install --upgrade virtualenv
   virtualenv YOUR_VIRTUAL_EVN_FOLDER
   source YOUR_VIRTUAL_EVN_FOLDER/bin/activate
   ```

   完成此工作后，可以通过操作来解除虚拟环境。
   ```bash
   deactivate
   ```
   要了解更多关于` virtualenv `，点击[这里]（https://virtualenv.pypa.io/en/stable/）

1. commit

    在进行你的第一次之前，请先安装必要的工具，像是flake8, yapf 与 [pre-commit](http://pre-commit.com/) 工具。
    VisualDL 开发人员使用 pre-commit, flake8, yapf 工具来管理 Git 预提交钩子。 它可以帮助我们格式化源代码（C++，Python），在提交（commit）前自动检查一些基本事宜。
    不满足钩子的 PR 不能被提交到 VisualDL，首先安装并在当前目录运行它：

    ```bash
    pip install -r requirements.txt
    pre-commit install
    ```

    VisualDL 使用 `clang-format` 来调整 C/C++ 源代码格式，请确保 [clang-format 3.8](http://releases.llvm.org/download.html) 版本在 3.8 以上。
    请下载且安装在 path上. 例如 `/usr/local/bin`

    ```bash
    # For example, install clang-format on Mac

    tar xvfJ clang+llvm-3.8.0-x86_64-apple-darwin.tar.xz -C ./clang_mac_install/
    cd clang_mac_install/clang+llvm-3.8.0-x86_64-apple-darwin/bin/
    ln -s $(pwd)/$(find clang-format | grep bin/clang-format$) /usr/local/bin/clang-format

    # or directly mv clang-format binary to there
    # mv clang-format /usr/local/bin/

    ```

    Git 每次提交代码，都需要写提交说明，这可以让其他人知道这次提交做了哪些改变，这可以通过`git commit` 完成。

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

1. 构建和测试

    Users can build VisualDL natively on Linux and Mac OS X.

1. 保持本地仓库最新

    在准备发起 Pull Request 之前，需要同步原仓库（<https://github.com/PaddlePaddle/VisualDL>）最新的代码。

    ```bash
    git remote add upstream https://github.com/PaddlePaddle/VisualDL
    git pull upstream develop
    ```

1. Push 到远程仓库

    将本地的修改推送到 GitHub 上，也就是 https://github.com/USERNAME/VisualDL。

    ```bash
    # 推送到远程仓库 origin 的 my-cool-stuff 分支上
    git push origin my-cool-stuff
    ```

1. 建立 Issue 并完成 Pull Request

    建立一个 Issue 描述问题，并记录它的编号。

    切换到所建分支，然后点击 `New pull request`。选择目标分支：

    <img width="295" alt="screen shot 2017-04-26 at 9 09 28 pm" src="https://cloud.githubusercontent.com/assets/11692045/25436054/a6d98c66-2ac4-11e7-9cb1-18dd13150230.png">

    在 PR 的描述说明中，填写 `fix #Issue编号` 可以在这个 PR 被 merge 后，自动关闭对应的 Issue，具体请见 <https://help.github.com/articles/closing-issues-via-commit-messages/>。

    接下来等待 review，如果有需要修改的地方，参照上述步骤更新 origin 中的对应分支即可。

1. 删除远程分支

    在 PR 被 merge 进主仓库后，我们可以在 PR 的页面删除远程仓库的分支。

    <img width="775" alt="screen shot 2017-04-26 at 9 18 24 pm" src="https://cloud.githubusercontent.com/assets/11692045/25436457/e4cdd472-2ac5-11e7-9272-badc76c4a23e.png">

    也可以使用 `git push origin :分支名` 删除远程分支，如：

    ```bash
    git push origin :my-cool-stuff
    ```

1. 删除本地分支

    最后，删除本地分支。

   ```bash
   # 切换到 develop 分支
   git checkout develop
   # 删除 my-cool-stuff 分支
   git branch -d my-cool-stuff
   ```

至此，我们就完成了一次代码贡献的过程。

## 提交代码的一些约定

为了使评审人在评审代码时更好地专注于代码本身，请您每次提交代码时，遵守以下约定：
1. 请保证Travis-CI 中单元测试能顺利通过。如果没过，说明提交的代码存在问题，评审人一般不做评审。
2. 提交PUll Request前：
   - 请注意commit的数量：
     - 原因：如果仅仅修改一个文件但提交了十几个commit，每个commit只做了少量的修改，这会给评审人带来很大困扰。评审人需要逐一查看每个commit才能知道做了哪些修改，且不排除commit之间的修改存在相互覆盖的情况。
     - 建议：每次提交时，保持尽量少的commit，可以通过`git commit --amend`补充上次的commit。对已经Push到远程仓库的多个commit，可以参考[squash commits after push](http://stackoverflow.com/questions/5667884/how-to-squash-commits-in-git-after-they-have-been-pushed)。
   - 请注意每个commit的名称：应能反映当前commit的内容，不能太随意。
3. 如果解决了某个Issue的问题，请在该PUll Request的**第一个**评论框中加上：`fix #issue_number`，这样当该PUll Request被合并后，会自动关闭对应的Issue。关键词包括：close, closes, closed, fix, fixes, fixed, resolve, resolves, resolved，请选择合适的词汇。详细可参考[Closing issues via commit messages](https://help.github.com/articles/closing-issues-via-commit-messages)。

此外，在回复评审人意见时，请您遵守以下约定：
1. 评审人的每个意见都必须回复（这是开源社区的基本礼貌，别人帮了忙，应该说谢谢）：
   - 对评审意见同意且按其修改完的，给个简单的`Done`即可；
   - 对评审意见不同意的，请给出您自己的反驳理由。
2. 如果评审意见比较多：
   - 请给出总体的修改情况。
   - 请采用[start a review](https://help.github.com/articles/reviewing-proposed-changes-in-a-pull-request/)进行回复，而非直接回复的方式。原因是每个回复都会发送一封邮件，会造成邮件灾难。
