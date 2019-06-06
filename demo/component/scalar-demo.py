# coding=utf-8
from visualdl import LogWriter
# 创建LogWriter对象
log_writer = LogWriter("./log", sync_cycle=20)
# 创建 scalar 组件，模式为train,
with log_writer.mode("train") as logger:
    train_acc = logger.scalar("acc")
    train_loss = logger.scalar("loss")
# 创建 scalar 组件，模式设为 test， tag 设为 acc
with log_writer.mode("test") as logger:
    test_acc = logger.scalar("acc")
value = [i / 1000.0 for i in range(1000)]
for step in range(1000):
    # 向名称为 acc 的图中添加模式为train的数据
    train_acc.add_record(step, value[step])
    # 向名称为 loss 的图中添加模式为train的数据
    train_loss.add_record(step, 1 / (value[step] + 1))
    # 向名称为 acc 的图中添加模式为test的数据
    test_acc.add_record(step, 1 - value[step])
