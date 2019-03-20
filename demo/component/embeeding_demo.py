import numpy as np
from visualdl import LogWriter


def record_embedding(vdl_embedding_comp):
    hot_vectors = np.random.uniform(1, 2, size=(10, 3))
    word_dict = {
        "label1": 1,
        "label2": 2,
        "label3": 3,
    }

    vdl_embedding_comp.add_embeddings_with_word_dict(hot_vectors, word_dict)


def main():
    log_writter = LogWriter("./vdl_log", sync_cycle=10)
    with log_writter.mode("train") as logger:
        vdl_embedding_comp = logger.embedding()

    # after record, use visualdl --logdir vdl_log to load the log info,
    # and view the data in webpage
    record_embedding(vdl_embedding_comp)


if __name__ == "__main__":
    main()
