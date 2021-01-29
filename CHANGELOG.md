# Change Log

VisualDL的更新记录在此查看。

This is the Changelog for the VisualDL 2.0 project.

## v2.1.1 - 2020-01-28

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
- 其他改进
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
