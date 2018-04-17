# RELEASE 1.0.0

## New Features

- Improve the Graph feature to include interactive response. Users can now click on a node to inspect its details such as parameters, input, output, dimensions, etc. They can also zoom in/out and move around if the graph is too large, restore to its original size and download it as PNG.
- Add new `Audio` recording visualization. Users can recording audio and inspect to help fine tuning the audio training.
- Add new `Text` recording visualization. Users can record strings during training and inspect later.
- User can manually `save` to sync the recordings to the disk.

## Bug Fixes and improvements

- Fix Scalar incorrect wall time display
- Fix incorrect timestamp label display
- Fix the Travis-CI not failing issue
- Fix the last recording not showing
- Update and clarify ImageWriter API docs for input params.
- VisualDL will call `SyncToDisk` before exiting.
- Adjust the interval between each `SyncToDisk` to improve performance.
- Enforce ESLint coding standard.
