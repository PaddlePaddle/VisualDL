from visualdl import LogWriter


def record_scalar(vdl_scalar_comp):
    for i in range(1, 101):
        vdl_scalar_comp.add_record(i, i**2)


def main():
    log_writter = LogWriter("./vdl_log", sync_cycle=10)
    with log_writter.mode("train") as logger:
        vdl_scalar_comp = logger.scalar(tag="test")

    # after record, use visualdl --logdir vdl_log to load the log info,
    # and view the data in webpage
    record_scalar(vdl_scalar_comp)


if __name__ == "__main__":
    main()
