# 使用VisualDL在HDFS上读写日志
### 概述
Hadoop分布式文件系统（HDFS）是用为Hadoop框架编写的可伸缩且可移植的分布式文件系统。目前VisualDL支持基于HDFS的日志存储和读取。

## 环境准备
### VisualDL
VisualDL在2.0.0b7版本之后增加了对HDFS的支持，可使用下述命令安装
```shell
pip install visualdl==2.0.0b7
```

### HDFS
#### HDFS Python SDK
VisualDL使用`hdfs`的SDK完成对日志的读写，因此需要安装`hdfs`，可使用下述命令安装
```shell
pip install hdfs
```
#### 配置~/.hdfs.cfg
`hdfs` Python SDK需要使用`～/.hdfs.cfg`文件获得HDFS账户及地址信息，文件内容如下

```
[dev.alias]
url = http://dev.namenode:port # HDFS地址
user = ann                     # 用户名
```
详细配置方式请参照[HdfsCLI Configuration](https://hdfscli.readthedocs.io/en/latest/quickstart.html#configuration)

## 记录日志
日志的记录方式与使用本地文件系统相似，仅需要在设置文件路径时指定为hdfs即可，方式为在指定的logdir前添加`hdfs://`。以scalar为例，代码如下：
```python
from visualdl import LogWriter

if __name__ == '__main__':
    value = [i/1000.0 for i in range(1000)]
    # 初始化一个记录器
    # 仅需在路径前添加`hdfs://`即可
    with LogWriter(logdir="hdfs://./log/scalar_test/train") as writer:
        for step in range(1000):
            # 向记录器添加一个tag为`acc`的数据
            writer.add_scalar(tag="acc", step=step, value=value[step])
            # 向记录器添加一个tag为`loss`的数据
            writer.add_scalar(tag="loss", step=step, value=1/(value[step] + 1))
```

## 展示日志
与使用本地文件系统相似，通过修改启动参数中`logdir`的指向即可，方式为在指定的logdir前添加`hdfs://`，如下：
```shell
visualdl --logdir 'hdfs://./log/scalar_test/train'
```