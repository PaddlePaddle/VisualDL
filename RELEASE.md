# 2.0.0-alpha.0

**This is a PRE-RELEASE version of VisualDL 2.0. Please DO NOT use it in production environment.**

## Improvements

- **backend:** improve performance of plugin scalar and image by uploading logs incrementally

## Features

- **frontend:** completely newly-designed web user interface (for more information, please refer to [Frontend Readme](https://github.com/PaddlePaddle/VisualDL/blob/develop/frontend/README.md))

## BREAKING CHANGES

- `Histogram` is not available in this version.
- Audio and text samples are not available in this version.
- Plugin image displays 10pcs sampled images in this version.

# RELEASE 1.3.0

## New Features

- Support show paddle model，user can use **paddle.fluid.io.save_inference_model()** to save their model to <SAVE_MODEL_PATH>, and then use **visualdl --model_pb <SAVE_MODEL_PATH>** to load the model
- Change the dependent version of protobuf to 3.1.0


# RELEASE 1.2.1

## New Features

- Add language Selection options. Users can use -L or --language option to select the language show in the webpage(1.2.1 only support {zh, en}, and default is en)


# RELEASE 1.2.0

## New design

- Cleaner and more organized interface
- Show / select runs in global bar instead of individual tab
- Merge Scalar and Histogram into Metrics
- Merge Image, Audio and Text into Samples
- New Config design, add filter types in config
- New tags bar design instead of expand panel, easier to filter by tags
- New search bar integrated on tags bar
- Improve performance by showing less duplicate charts with tabs bar design


# RELEASE 1.1.0

## New Features

- Add new `High Dimensional / embeddings` recording visualization. Users can visualize data embeddings by projecting high-dimensional data into 2D / 3D
- Add Caffe2 Demo and tutorial
- Update `vdl_create_log`, add embeddings data and ONNX model in scratch_log
- Windows support


## Bug Fixes and improvements

- Fix issues where different Python libraries conflicted in Mac
- Update Visual DL new logo


# RELEASE 1.0.0

## New Features

- Improve the Graph feature to include interactive response. Users can now click on a node to inspect its details such as parameters, input, output, dimensions, etc. They can also zoom in/out and move around if the graph is too large, restore to its original size and download it as PNG.	- Add new `High Dimensional / embeddings` recording visualization. Users can visualize data embeddings by projecting high-dimensional data into 2D / 3D
- Add new `Audio` recording visualization. Users can recording audio and inspect to help fine tuning the audio training.	- Add Caffe2 Demo and tutorial
- Add new `Text` recording visualization. Users can record strings during training and inspect later.	- Update `vdl_create_log`, add embeddings data and ONNX model in scratch_log
- User can manually `save` to sync the recordings to the disk.


## Bug Fixes and improvements

- Fix Scalar incorrect wall time display	- Fix issues where different Python libraries conflicted in Mac
- Fix incorrect timestamp label display	- Update Visual DL new logo
- Fix the Travis-CI not failing issue
- Fix the last recording not showing
- Update and clarify ImageWriter API docs for input params.
- VisualDL will call `SyncToDisk` before exiting.
- Adjust the interval between each `SyncToDisk` to improve performance.
- Enforce ESLint coding standard.
