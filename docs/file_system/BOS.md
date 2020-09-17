# 使用VisualDL在BOS上读写日志
### 概述
百度对象存储BOS(Baidu Object Storage)提供稳定、安全、高效以及高扩展存储服务，支持单文件最大5TB的文本、多媒体、二进制等任何类型的数据存储。目前VisualDL支持基于BOS的日志存储和读取。

## 环境准备
### VisualDL
VisualDL在2.0.0b8版本之后增加了对BOS的支持，可使用下述命令安装
```shell
pip install visualdl
```

### BOS
#### BOS Python SDK
VisualDL使用`bce-python-sdk`的SDK完成对日志的读写，因此需要安装`bce-python-sdk`，可使用下述命令安装

首先安装`pycrypto`依赖：
```shell
pip install pycrypto
```
如果安装失败，则安装`pycryptodome`作为替换依赖：
```
pip install pycryptodome
```
最后安装`bce-python-sdk`
```shell
pip install bce-python-sdk
```
#### 配置BOS地址
`bce-python-sdk`需要提供BOS地址及密钥，通过环境变量进行配置，具体如下：

配置BosClient的Host
```shell
export BOS_HOST=XXXXX
```

配置Access Key ID
```shell
export BOS_AK=XXXXX
```

配置Secret Access Key
```shell
export BOS_SK=XXXXX
```

关于Bos设置的更多信息，请参照[Bos初始化](https://cloud.baidu.com/doc/BOS/s/5jwvyrf21)

## 记录日志
日志的记录方式与使用本地文件系统相似，仅需要在设置文件路径时指定为`bos`即可，方式为在指定的logdir前添加`bos://`。以scalar为例，代码如下：
```python
from visualdl import LogWriter

if __name__ == '__main__':
    value = [i/1000.0 for i in range(1000)]
    # 初始化一个记录器
    # 仅需在路径前添加`bos://`即可
    with LogWriter(logdir="bos://my_bucket/log/scalar/train") as writer:
        for step in range(1000):
            # 向记录器添加一个tag为`acc`的数据
            writer.add_scalar(tag="acc", step=step, value=value[step])
            # 向记录器添加一个tag为`loss`的数据
            writer.add_scalar(tag="loss", step=step, value=1/(value[step] + 1))
```

## 展示日志
与使用本地文件系统相似，通过修改启动参数中`logdir`的指向即可，方式为在指定的logdir前添加`bos://`，如下：
```shell
visualdl --logdir 'bos://my_bucket/log/scalar/train'
```
