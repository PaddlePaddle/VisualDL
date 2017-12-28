
# Download inception_v1 model
curl -LOk https://s3.amazonaws.com/download.onnx/models/inception_v1.tar.gz

tar -xvzf inception_v1.tar.gz
cp inception_v1/model.pb inception_v1_model.pb

rm -rf inception_v1
rm inception_v1.tar.gz


# Download squeezenet model
curl -LOk https://s3.amazonaws.com/download.onnx/models/squeezenet.tar.gz

tar -xvzf squeezenet.tar.gz
cp squeezenet/model.pb squeezenet_model.pb

rm -rf squeezenet
rm squeezenet.tar.gz

