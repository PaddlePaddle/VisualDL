script=$(readlink -f "$0")
script_path=$(dirname "$script")

pushd $script_path
  protoc visualdl/onnx/onnx.proto --python_out .
  python setup.py bdist_wheel
popd
