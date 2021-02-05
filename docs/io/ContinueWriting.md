## 日志续写
在训练时常遇到中断后继续训练的场景，我们希望恢复训练后的日志能够继续保存在上一次的日志文件中，以便查看，VisualDL的LogWriter提供了续写功能，通过创建LogWriter时指定`logdir`和`file_name`，可以将日志续写到已经存在的日志中，下面展示一个demo：


#### 第一次训练
```python
from visualdl import LogWriter

# 在`./log`文件夹下生成一个日志文件
with LogWriter(logdir='./log') as writer:
    for index in range(100):
        writer.add_scalar(tag='test_1', value=index, step=index)
```
执行此脚本后，在`log`文件夹将会生成一个VisualDL日志文件，假定为`vdlrecords.1612492979.log`，在命令行执行`visualdl --logdir ./log`即可可视化记录的日志，如图：
<p align="center">
  <img src="https://user-images.githubusercontent.com/28444161/106982590-55178d80-679f-11eb-9b83-4292215e22dd.png" width="80%"/>
</p>

#### 再次训练并续写日志
当我们继续训练并希望将日志续写在上一个日志文件中时，指定上一次训练生成的日志文件名即可，如下：
```python
from visualdl import LogWriter

# 指定上一次使用的文件夹(logdir)和日志文件名（file_name）即可
with LogWriter(logdir='./log', file_name='vdlrecords.1612492979.log') as writer:
    # step从101开始，这里的step如果和已经存在日志中的记录相同，在前端将会出现重叠现象
    for index in range(101,200):
        writer.add_scalar(tag='test_1', value=index, step=index)
```
执行此脚本会给出提示：
```shell
`./log/vdlrecords.1612492979.log` is exists, VisualDL will add logs to it.
```
此时我们再执行`visualdl --logdir ./log`可视化记录，如图：
<p align="center">
  <img src="https://user-images.githubusercontent.com/28444161/106983185-6e6d0980-67a0-11eb-88cf-c9529be43942.png" width="80%"/>
</p>
可以看出，我们第二次训练产生的日志已经记录到了上一次的日志文件中，完成了续写日志的需求。

值得注意的是，当我们指定的`file_name`不存在时，VisualDL将会依据此名新建一个日志文件，并在其上记录，但文件名需包括`vdlrecords`字符串，否则VisualDL仍将自动生成日志文件并记录。
