# coding=utf-8
import numpy as np
from visualdl import LogWriter
# 创建LogWriter对象
log_writer = LogWriter('./log', sync_cycle=10)
# 创建histogram组件，模式为train
with log_writer.mode("train") as logger:
    param1_histogram = logger.histogram("param1", num_buckets=100)
# 设定步数为 1 - 100
for step in range(1, 101):
    # 添加的数据为随机分布，所在区间值变小
    interval_start = 1 + 2 * step / 100.0
    interval_end = 6 - 2 * step / 100.0
    data = np.random.uniform(interval_start, interval_end, size=(10000))
    # 使用add_record()函数添加数据
    param1_histogram.add_record(step, data)
