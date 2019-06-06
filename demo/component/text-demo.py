# coding=utf-8
from visualdl import LogWriter

# 创建 LogWriter 对象
log_writter = LogWriter("./log", sync_cycle=10)

# 创建 text 组件，模式为 train， 标签为 test
with log_writter.mode("train") as logger:
    vdl_text_comp = logger.text(tag="test")

# 使用 add_record() 函数添加数据
for i in range(1, 6):
    vdl_text_comp.add_record(i, "这是第 %d 个 Step 的数据。" % i)
    vdl_text_comp.add_record(i, "This is data %d ." % i)
