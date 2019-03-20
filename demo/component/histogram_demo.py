import numpy as np
from visualdl import LogWriter


def record_histogram(vdl_histogram_comp):
    for i in range(1, 101):
        f = 1 + 2 * i / 100
        t = 6 - 2 * i / 100
        data = np.random.uniform(f, t, size=(500))
        vdl_histogram_comp.add_record(i, data)


def main():
    log_writter = LogWriter("./vdl_log", sync_cycle=10)
    with log_writter.mode("train") as logger:
        vdl_histogram_comp = logger.histogram(tag="test", num_buckets=50)

    # after record, use visualdl --logdir vdl_log to load the log info,
    # and view the data in webpage
    record_histogram(vdl_histogram_comp)


if __name__ == "__main__":
    main()
