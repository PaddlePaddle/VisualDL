# Frequently Asked Questions

[**中文**](./faq.md)

## How can I do when I see a blank page or error messages in the browser?
To work out bugs, you can follow the steps： 
1. You should ensure that the `logdir` path set by VisualDL is correct. In the meanwhile, there must be a log file and its name (including `vdlrecords`) should be correct. And then you can check the folder set by `logdir`. If it is not okay, try the next step.
2. Please check the browser and its version, and ensure it fits VisualDL. We suggest using **the latest versions** of Chrome browser, browsers with Chrome’s kernel, Firefox browser. Please change browsers and upgrade it to the latest version. If it is not okay, try the next step.
3. Please specify `--host`as `0.0.0.0` or `127.0.0.1`. And the latter one only supports the local address. If the server runs and you want to check by other addresses, please use `0.0.0.0` and ensure the end can be visited by outer net. If it is not okay, try the next step.
4. Close and re-open the front-end page of VisualDL. Or do a hard refresh on the browser and wait for 15-30 seconds. If it is not okay, try the next step.
5. If you use windows, please check whether the registry is modified. For users who want to get into more details, please refer to https://github.com/PaddlePaddle/VisualDL/issues/834. If all the steps do not work, please ask questions in VisualDL GitHub Issue. The link is [VDL Issue](https://github.com/PaddlePaddle/VisualDL/issues).

## When I use modules of Image, Audio and Text, there are only ten samples.
We apply random sampling algorithm to display sampled data, when using modules of Image, Audio and Text. In this way, the front-end page will not be stuck or will not crash because of too much data, and then we can ensure users’ experience. 

Though data shown in the front-page are sampled, all the data are saved in the log file. You can obtain all the data by using `VisualDL.LogReader`. For more details, please refer to our [LogReader tutorial](./components#LogReader).

## Why are the curves drawn by Scalar twisty?
Because there are two or more values in a certain step, you will find the curves you draw are like the following picture. Please check your script and find whether you add several values to one step, when using`add_scalar`.

<p align="center">
    <img src="https://user-images.githubusercontent.com/28444161/99496785-de44d280-29af-11eb-8fbd-ebc7a4919f2f.png" width="40%"/>
</p>


## How can I do when confronted with the error of official use cases, saying that the target of LogWriter does not have the mode attribute?

Please check the version of VisualDL you use (which visualdl). According to the error, it is most likely that you are using the VisualDL 1.3, which attributes to Python 2 you use. Python 2 will install the old version of VisualDL automatically.

At present, VisualDL does not support Python 2 any more. And the instructions of existing official documents ae based on VisualDL 2.0, which also will not support Python 2. We suggest upgrading the Python's version to Python 3 and installing the latest version of VisualDL. In this way, the problem will not appear again.