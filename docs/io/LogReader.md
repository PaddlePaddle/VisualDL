# LogReader

## 简介
VisualDL可通过LogReader获取保存的日志中所有数据，帮助用户进行更详细的分析工作。

## 使用方式

### 1. 获取LogReader实例

LogReader的初始化接口如下：
```python
class LogReader(logdir=None,
                file_name='')
```
#### 接口参数

| 参数            | 格式    | 含义                                                         |
| --------------- | ------- | ------------------------------------------------------------ |
| logdir          | string  | 日志文件所在的路径，必填|
| file_name       | string  | 指定要读的日志文件名，必填|

#### 示例

假定在`./log`文件夹下有一个日志文件`vdlrecords.1605533348.log`，则获取LogReader实例如下：

```python
from visualdl import LogReader

reader = LogReader(logdir='./log', file_name='vdlrecords.1605533348.log')
```

### 2. 获取所有数据的tag信息
通过接口`tags()`可获取LogReader实例对应日志中的所有数据tag信息，如下：
```python
tags = reader.tags()
```
结果如下，格式为`${file_name}/${tag}:${component_name}`
```python
{'vdlrecords.1605533348.log/meta_data_tag': 'meta_data', 'vdlrecords.1605533348.log/Metrics%Training(Step): loss': 'scalar', 'vdlrecords.1605533348.log/Metrics%Training(Step): acc1': 'scalar', 'vdlrecords.1605533348.log/Metrics%Training(Step): acc5': 'scalar', 'vdlrecords.1605533348.log/Metrics%Training(Step): lr': 'scalar', 'vdlrecords.1605533348.log/Metrics%Eval(Epoch): acc1': 'scalar', 'vdlrecords.1605533348.log/Metrics%Eval(Epoch): acc5': 'scalar'}
```

### 3. 获取某tag对应的数据
通过接口`get_data(component, tag)`可获取某组件某tag对应的所有数据，例如：
```python
# 获取scalar组件tag为`Metrics%Training(Step): loss`的数据
data = reader.get_data('scalar', 'Metrics%Training(Step): loss')
```
结果为列表形式，如下
```python
...
id: 5
tag: "Metrics/Training(Step): loss"
timestamp: 1605533356039
value: 3.1297709941864014
...
```