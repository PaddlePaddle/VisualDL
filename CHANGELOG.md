# Change Log

VisualDL的更新记录在此查看。

This is the Changelog for the VisualDL 2.0 project.

## v2.4.0 - 2022-08-22

**ZH**

- 功能新增
  - 增加性能数据可视化功能，提供Overview、Operator、GPU Kernel、Distributed、Trace、Memory共六个视图的分析。(#1112 #1114 #1118)
    - Overview视图

    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/185893177-a049c8d5-2310-4138-8dd5-844cf198e425.gif" width="80%"/>
    </p>

    - Operator视图

    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/185893218-bff646f1-3d9f-448b-99c8-39f2309db65d.gif" width="80%"/>
    </p>

    - GPU Kernel视图

    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/185893227-64837816-e6a5-41ad-b8f4-d1dfef3fd40b.gif" width="80%"/>
    </p>

    - Distributed视图

    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/185893682-e9330b99-e344-423a-8935-dc050a4cab45.gif" width="80%"/>
    </p>

    - Trace视图

    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/185893687-1788586e-4371-4136-baf7-f3edcbc19003.gif" width="80%"/>
    </p>

    - Memory视图

    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/185893743-43643f2d-0c5a-46ad-8ad8-b04ae48ecc97.gif" width="80%"/>
    </p>

**EN**

- Features
  - Add visualization for profiling data, support six viewers for analysis, i.e. Overview, Operator, GPU Kernel, Distributed, Trace and Memory. (#1112 #1114 #1118)
    - Overview

    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/185894151-53ffc60b-7203-4cb8-a289-5d97332d0691.gif" width="80%"/>
    </p>

    - Operator

    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/185894180-546c7012-6623-4163-b1d4-e7607b1ed72d.gif" width="80%"/>
    </p>

    - GPU Kernel

    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/185894242-ec382146-56aa-42bc-ae81-ed7221b72bb4.gif" width="80%"/>
    </p>

    - Distributed

    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/185894274-fc9aae45-0faf-429c-8c5e-54ea0a45cbf2.gif" width="80%"/>
    </p>

    - Trace

    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/185894306-05eb72ca-33b9-4b49-a036-2f4b3b1e7e65.gif" width="80%"/>
    </p>

    - Memory

    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/185894209-fec56d3c-65ef-4240-a957-0965521d36f7.gif" width="80%"/>
    </p>


## v2.3.0 - 2022-06-30

**ZH**

- 功能新增
  - **BE**:  增加add_graph接口支持动态图模型可视化 （#1077 #1093）
  - **FE**:  增加动态图可视化页面 （#1091 #1096 #1097）
    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/175808777-5bc24d7a-9115-44d0-8709-a82a3e341b3d.gif" width="80%"/>
    </p>
    
    - 展开和折叠指定节点
    
    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/175810790-a35f83bf-a23c-4a28-afb7-2e0cf7711b9c.png" width="80%"/>
        </p>

    - 一键全展开和全折叠
    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/175809551-67f67552-59b7-4aca-a1cc-fe5606e7e512.png" width="80%"/>
        </p>
    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/175809610-d07c0b15-d1bd-4542-aacd-29b4d2ba8fcb.png" width="80%"/>
    </p>

    - 飞桨API链接功能
    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/175809570-241db056-0b41-4e3a-828d-376a011a4645.png" width="80%"/>
    </p>
    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/175809574-8c173b88-ed27-4c29-a3e1-a3887d2d3107.png" width="80%"/>
    </p>
    

- 问题修复
  - **FE**:  修复图像数据放大后比例失调的问题 （##1090）

- 其他改进
  - **FE**:  优化文本数据显示的用户体验 （##1090）

**EN**

- Features
  - **BE**:  Add add_graph interface for dynamic model of paddle（#1077 #1093）
  - **FE**:  Add dynamic graph page （#1091 #1096 #1097）
  <p align="center">
  <img src="https://user-images.githubusercontent.com/22424850/175811156-a80ca0c4-207d-44d7-bd5a-9701a7875722.gif" width="80%"/>
    </p>

    - Fold and unfold one node
    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/175810800-4823b9f1-3d59-44e8-aaa5-a80577624452.png" width="80%"/>
    </p>
    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/175810790-a35f83bf-a23c-4a28-afb7-2e0cf7711b9c.png" width="80%"/>
    </p>

    - Fold and unfold all nodes
    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/175810856-ff98a1ed-2a4f-4cc1-bc9b-3085857c0b81.png" width="80%"/>
    </p>
    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/175810837-a0953956-7320-4e78-9c52-72ad13962216.png" width="80%"/>
    </p>

    - Link api specification of paddle
    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/175810992-b86e9aef-e700-4c2d-bcd0-21fc96fc2564.png" width="80%"/>
    </p>
    <p align="center">
    <img src="https://user-images.githubusercontent.com/22424850/175810997-0672d836-4d7c-432d-b5de-187f97c421ae.png" width="80%"/>
    </p>
- Bug Fixes
  - **FE**:  Fix unbalance ratio of upscaled image when zoom in. （##1090）

- Enhancement
  - **FE**:  Refine user experience for text presentation. （##1090）


## v2.2.1 - 2021-09-02

**ZH**

- 问题修复
    - **FE**: 修复错误页面跳转链接错误的问题 (#973)
    - **BE**: 更新 VDL.service 的链接 (#976)
    - **FE**: 修复标量数据部分情况下极值无法正确显示的问题 (#981)
    - **FE**: 修复标量数据 WallTime 显示错误的问题 (#998)
    - **FE**: 修复标量数据坐标轴范围计算错误的问题 (#998)

- 其他改进
    - 折线图可以显示 `NaN` 和 `Infinity` 了 (#983, #984, #998)
    - **BE**: 数据采样时永远保留最新值 (#980)


**EN**

- Bug Fixes
    - **FE**: Fix link error in error pages (#973)
    - **BE**: Update endpoint of VDL.service (#976)
    - **FE**: Fix extrema cannot display in some cases in scalar page (#981)
    - **FE**: Fix WallTime display error in scalar page (#998)
    - **FE**: Fix axis range calculation error in scalar page (#998)

- Enhancement
    - `NaN` and `Infinity` values can display in scalar charts (#983, #984, #998)
    - **BE**: Keep the latest values when sampling data (#980)

## v2.2.0 - 2021-05-23

**ZH**

- 问题修复
    - **BE**: 修复 `Image` 组件使用 `numpy.pad` 接口版本兼容性问题 (#927)
    - **BE**: 修复 `add_embedding` 接口 `mat` 参数不支持 `ndarray` 的问题 (#930)
    - **BE**: 修复 `embedding` 接口 `display_name` 失效问题 (#935)
    - **BE**: 修复全局 `Logger` 占用问题 (#944)
    - **FE**: 修复主题在某些情况下不会随着系统设置的改变更新的问题 (#947)
    - **FE**: 修复数据降维页面中当数据量很大时数据显示错误的问题 (#947)

- 功能新增
    - **FE**: 数据降维支持三维标签展示 (#947)
    - **FE**: 数据降维支持色彩映射 (#950)
    - 新增超参可视化 (#960, #961, #962, #964, #966, #967)

- 其他改进
    - **FE**: 包含数据流的侧边栏可以拖动调整大小 (#949)
    - **FE**: 重新设计的导航栏 (#949, #951, #962)

**EN**

- Bug Fixes
    - **BE**: Fix the compatibility problem of `Image` component using `numpy.pad` interface (#927)
    - **BE**: Fix fix the problem that `mat` parameter of the `add_embedding` interface does not support `ndarray` (#930)
    - **BE**: Fix the failure of `display_name` in `embedding` interface (#935)
    - **BE**: Fix global `Logger` being occupied (#944)
    - **FE**: Fix theme couldn't be changed in some case when system preference is changed (#947)
    - **FE**: Fix display error when data size is large in high-dimensional page (#947)

- Features
    - **FE**: Add 3d label display in high-dimensional page (#947)
    - **FE**: Add color map in high-dimensional page (#950)
    - Add Hyper-parameters (#960, #961, #962, #964, #966, #967)

- Enhancement
    - **FE**: Sidebar with runs is now resizable (#949)
    - **FE**: Re-designed navbar (#949, #951, #962)

## v2.1.1 - 2021-01-28

**ZH**

- 问题修复
    - **FE**: 修复部分浏览器的兼容性问题 (#903)
    - **FE**: 修复深色模式下切换页面会闪白的问题 (#903)
    - **BE**: 修复旧版本的日志无法上传 VisualDL Service 的问题 (#912)
- 功能新增
    - 增加文本样本 (#917)
    - **BE**: 增加图像组写入功能 (#909)
- 其他改进
    - **FE**: 增加了浏览器不兼容时的提示 (#903)
    - **FE**: 调整样本页面的标题顺序 (#908)
    - **FE**: 更好的载入提示 (#908)

**EN**

- Bug Fixes
    - **FE**: Fix compatibility in some browsers (#903)
    - **FE**: Fix flashing when switch between pages in dark mode (#903)
    - **BE**: Fix the old version of log cannot be uploaded to VisualDL Service (#912)
- Features
    - Add Text Sample (#917)
    - **BE**: Add images matrix writing function (#909)
- Enhancement
    - **FE**: Add browser compatibility tip (#903)
    - **FE**: Adjust title order of sample pages (#908)
    - **FE**: Better loading experience (#908)

## v2.1.0 - 2020-12-28

**ZH**

- 问题修复
    - **BE**: 修复无关文件会被上传到 VDL-Service 的问题 (#866)
    - **BE**: 改正错误的代码注释 @foreverseer (#877)
- 功能新增
    - 重写高维数据映射 (#868, #869, #870, #874)
    - 增加标量数据图表中原始数据的下载功能 (#879, #893, #894, #896)
    - 增加ROC曲线功能 @iceriver97 (#881)
- 其他改进
    - **FE**: 改进 WebAssembly 和 WebWorker 的执行方式 (#871)
    - **BE**: 支持 `ndarray` 的 `float32` 和 `double64` 类型 (#878)
- 重要改动
    - **BE**: `LogReader` 中参数名由 `file_name` 改为 `file_path` (#864)

**EN**

- Bug Fixes
    - **BE**: Fix unrelated files uploaded to VDL-Service (#866)
    - **BE**: Fix confused code comments @foreverseer (#877)
- Features
    - Rewrite High-dimension (#868, #869, #870, #874)
    - Add raw data download support in scalar chart (#879, #893, #894, #896)
    - Add ROC Curve @iceriver97 (#881)
- Enhancement
    - **FE**: Improve execution of WebAssembly and WebWorker (#871)
    - **BE**: Support `float32` and `double64` in `ndarray` (#878)
- Breaking Changes
    - **BE**: Use `file_path` instead of `file_name` in `LogReader` (#864)

## v2.0.5 - 2020-11-24

**ZH**

- 问题修复
    - **FE**: 修复histogram页面图表坐标轴名称会重复渲染的问题 (#824)
    - **FE**: 修复图表提示窗中表格内容过长的问题 (#829)
    - **BE**: 修复Windows下注册表配置不正确时页面无法打开的问题 (#832)
    - **FE**: 修复Scalar图表提示窗中表格数据无法按照选择的X轴指标进行展示的问题 (#851)
    - **FE**: 修复Scalar图表Y轴范围不正确的问题 (#851)
- 功能新增
    - **FE**: Sample页面支持使用键盘快速修改step (#829)
    - **FE**: Sample页面中的Image可以放大查看原图 (#829)
    - **FE**: 增加主题切换功能 (#830)
    - **BE**: 增加`LogReader`模块 (#827)
- 其他改进
    - **FE**: 改进Scalar图表提示窗中relative的可读性 (#851)

**EN**

- Bug Fixes
    - **FE**: Remove unnecessary render of histogram chart axis label (#824)
    - **FE**: Limit max length of runs in chart tooltip table (#829)
    - **BE**: Fix mime type error when registry settings are broken on Windows (#832)
    - **FE**: Get nearest points listed in tooltip of scalar page by selected x-axis (#851)
    - **FE**: fix y axis range error in scalar chart (#851)
- Features
    - **FE**: Add keyboard shortcuts in sample page (#829)
    - **FE**: Add image preview in image sample page (#829)
    - **FE**: Add theme toggle (#830)
    - **BE**: Add `LogReader` (#827)
- Enhancement
    - **FE**: humanize relative time display in tooltip of scalar chart (#851)

## v2.0.4 - 2020-09-21

**ZH**

- 问题修复
    - **BE**: 修复add_pr_curve不支持list的问题 (#810)
    - **FE**: 修复tooltip图标间距错乱的问题 (#815)
    - **FE**: 修复index载入中未居中 (#815)
    - **FE**: 修复图表载入中消失的问题 (#815)
    - **FE**: 时间日期无法被正确的格式化的问题 (#813, #815)
    - **BE**: 修复PR Curve中display_name显示的问题 (#816)
- 功能新增
    - 推出 VisualDL Service
    - **FE**: 支持深色模式

**EN**

- Bug Fixes
    - **BE**: Fix list not support add_pr_curve (#810)
    - **FE**: Fix chart toolbox icons gap chaos (#815)
    - **FE**: Index loading not centered (#815)
    - **FE**: Get missing echarts loading back (#815)
    - **FE**: Date & time cannot be formatted to correct locale string (#813, #815)
    - **BE**: Fix pr display_name bug (#816)
- Features
    - Introduce VisualDL Service
    - **FE**: Dark mode support

## v2.0.3 - 2020-09-14

**ZH**

- 问题修复
    - **BE**: 修复BOS文件系统追加问题 (#778)
    - **FE**: PR 曲线图表 Y 轴自适应数值 (#756) (#773)
    - **BE**: 修复Win10下命令行颜色不正常的问题 (#784)
    - **FE**: 修复跳转到index时参数丢失的问题 (#804)
    - **FE**: 修复只有step 0时直方图无法正常渲染的问题 (#807)
    - **FE**: 修复切换到访问过的页面时载入消失的问题 (#809)
    - **FE**: 修复标量和PR曲线的图表详情超长无法滚动的问题 (#809)
    - **BE**: 修复删除BOS文件后卡住的问题 (#805)
- 功能新增
    - 标量增加最值显示 (#779, #808)
    - **BE**: `LogWriter()`增加`file_name`以支持续写 (#764)
    - **FE**: 网络结构支持子图 (#787)
    - **FE**: 切换页面时记住选中的数据流 (#788, #809, #800)
    - **FE**: 标量页面增加只显示平滑后数据选项 (#795)
    - **FE**: 平滑度可以从页面参数中获取 (#797)
    - **FE**: 标量页面记住之前选择的平滑度 (#797)
    - **FE**: 网络结构记住用户上次选中的模型文件 (#789)
- 其他改进
    - 使用毫秒增加数据精度 (#781, #783)
    - **BE**: 增加文件队列超时 (#772, #776)
    - **BE**: 去除对cv2的依赖 (#769)
    - **FE**: 使用es module以去除对webpack和nextjs的依赖 (#786)
    - **FE**: 更友好的错误提示 (#797, #804)

**EN**

- Bug Fixes
    - **BE**: Fix append to bos (#778)
    - **FE**: PR Curve chart Y axis will adaptive values now (#756) (#773)
    - **BE**: Fix command color bug on win10 (#784)
    - **FE**: Query string missing when redirect from root to index (#804)
    - **FE**: Histogram cannot be rendered properly when data only has step 0 (#807)
    - **FE**: Bring loading back when switching to a visited page (#809)
    - **FE**: Scroll tooltips in scalar & pr-curve to prevent content overflow (#809)
    - **BE**: Fix bugs when delete bos file (#805)
- Features
    - Add global extrema in scalar (#779, #808)
    - **BE**: Add `file_name` in `LogWriter()` for rewriting (#764)
    - **FE**: Subgraph support for graph page (#787)
    - **FE**: Remember selected runs between pages (#788, #809, #800)
    - **FE**: Add smoothed data only option in scalar page (#795)
    - **FE**: Set smoothing from query string (#797)
    - **FE**: Remember smoothing in scalar page (#797)
    - **FE**: Restore selected model when navigating back to graph page (#789)
- Enhancement
    - Use milliseconds to increase accuracy of data (#781, #783)
    - **BE**: Add timeout for file queue (#772, #776)
    - **BE**: Remove requirement of cv2 (#769)
    - **FE**: Get rid of webpack & nextjs while introducing es module (#786)
    - **FE**: Better error tip (#797, #804)

## v2.0.1 - 2020-08-19

**ZH**

- 优化audio组件数据输入格式

**EN**

- Improve input format of audio component

## v2.0.0 - 2020-08-12

**ZH**

- API全面升级，设计简洁易用。
- 优化日志采集策略，极大提升可视化性能。
- 七大可视化功能全面覆盖：Scalar、Image、Audio、Graph、Histogram、PR Curve、High Dimensional
- 新增支持BOS、HDFS等多种文件系统。

**EN**

- The design of API is fully upgraded to make it easy to understand and use
- Optimizing the strategy of collecting logs tremendously enhances the overall performance
- Seven functions are provided, including Scalar, Image, Audio, Graph, Histogram, PR Curve and High Dimensional
- Besides the support of domestic file system, additional file systems are also supported, such as BOS and HDFS
