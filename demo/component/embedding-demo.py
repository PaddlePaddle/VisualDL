# coding=utf-8
import numpy as np
from visualdl import LogWriter

# 创建一个LogWriter对象
log_writer = LogWriter("./log", sync_cycle=10)

# 创建一个 high dimensional 组件，模式设为 train
with log_writer.mode("train") as logger:
    train_embedding = logger.embedding()

# 第一个参数为数据，数据类型为 List[List(float)]
hot_vectors = np.random.uniform(1, 2, size=(10, 3))
# 第二个参数为字典，数据类型为 Dict[str, int]
# 其中第一个分量为坐标点的名称, 第二个分量为该坐标对应原数据的第几行分量
word_dict = {
    "label_1": 5,
    "label_2": 4,
    "label_3": 3,
    "label_4": 2,
    "label_5": 1,
}

# 使用 add_embeddings_with_word_dict(data, Dict)
train_embedding.add_embeddings_with_word_dict(hot_vectors, word_dict)
