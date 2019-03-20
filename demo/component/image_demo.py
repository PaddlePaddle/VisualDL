import numpy as np
from visualdl import LogWriter
from PIL import Image

num_samples = 1


def random_crop(img):
    img = Image.open(img)
    w, h = img.size
    random_w = np.random.randint(0, w - 100)
    random_h = np.random.randint(0, h - 100)
    return img.crop((random_w, random_h, random_w + 100, random_h + 100))


def record_image(vdl_image_comp):
    sample_num = 0
    record_times = num_samples * 3
    image_path = "test.jpg"
    for i in range(record_times):
        if sample_num % num_samples == 0:
            vdl_image_comp.start_sampling()
        idx = vdl_image_comp.is_sample_taken()
        if idx != -1:
            image_data = np.array(random_crop(image_path))
            vdl_image_comp.set_sample(idx, image_data.shape,
                                      image_data.flatten())
            sample_num += 1
            if sample_num % num_samples == 0:
                vdl_image_comp.finish_sampling()
                sample_num = 0


def main():
    log_writter = LogWriter("./vdl_log", sync_cycle=10)
    with log_writter.mode("train") as logger:
        vdl_image_comp = logger.image(tag="test", num_samples=num_samples)

    # after record, use visualdl --logdir vdl_log to load the log info,
    # and view the data in webpage
    record_image(vdl_image_comp)


if __name__ == "__main__":
    main()
