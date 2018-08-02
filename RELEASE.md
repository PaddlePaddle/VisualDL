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
