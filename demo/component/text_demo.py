from visualdl import LogWriter


def record_text(vdl_text_comp):
    for i in range(1, 6):
        vdl_text_comp.add_record(i, "this is test text_%d" % i)


def main():
    log_writter = LogWriter("./vdl_log", sync_cycle=10)
    with log_writter.mode("train") as logger:
        vdl_text_comp = logger.text(tag="test")

    # after record, use visualdl --logdir vdl_log to load the log info,
    # and view the data in webpage
    record_text(vdl_text_comp)


if __name__ == "__main__":
    main()
