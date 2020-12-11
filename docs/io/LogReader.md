# LogReader

## 简介
VisualDL可通过LogReader获取保存的日志中所有数据，帮助用户进行更详细的分析工作。

## LogReader主要方法说明

### __init__(file_path)

#### 功能

初始化一个LogReader实例，用于读取指定日志的内容。

#### 接口参数

| 参数            | 格式    | 含义                                                         |
| --------------- | ------- | ------------------------------------------------------------ |
| file_path       | string  | 指定要读的日志文件路径，必填，注意这里与file_name不同，需填写具体路径|

#### 示例

假定在`./log`文件夹下有一个日志文件`vdlrecords.1605533348.log`，则获取LogReader实例如下：

```python
from visualdl import LogReader

reader = LogReader(file_path='./log/vdlrecords.1605533348.log')
```

### get_tags()

#### 功能

获取日志中所有记录的组件及其包括的tag

#### 接口参数

无

#### 示例

```python
tags = reader.get_tags()
```
结果如下，格式为`{component_name1: [tag1, tag2,  ... tagn], component_name2: [tag1, tag2,  ... tagn]}`
```python
# 这表示日志中有两个组件，分别是默认的`meta_data`和含有两个tag的`scalar`
{'meta_data': ['meta_data_tag'], 'scalar': ['tag/train', 'tag/test']}
```

### get_data(component, tag)

#### 功能

获取指定component（如`scalar`、`image`等）下某个tag的所有数据，返回值为一个列表

#### 接口参数

| 参数            | 格式    | 含义                                                         |
| --------------- | ------- | ------------------------------------------------------------ |
| component       | string  | 指定要读取的组件类型，可以为`scalar`、`image`等|
| tag       | string  | 指定要读取的tag|

#### 示例

假设要获取tag为`tag/test`的数据，则代码如下：
```python
data = reader.get_data('scalar', 'tag/test')
```
结果为列表形式，如下
```python
...
id: 5
tag: "Metrics/Training(Step): tag%test"
timestamp: 1605533356039
value: 3.1297709941864014
...
```
PS：为了兼容前端URL请求，此处的%是由/替换生成，不影响数据本身
