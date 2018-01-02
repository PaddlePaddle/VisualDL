
# Download inception_v1 model
curl -LOk http://visualdl.bj.bcebos.com/inception_v1.tar.gz
#curl -LOk https://www.dropbox.com/s/twbfdqgvowzy762/inception_v1.tar.gz?dl=0
tar -xvzf inception_v1.tar.gz
cp inception_v1/model.pb inception_v1_model.pb

rm -rf inception_v1
rm inception_v1.tar.gz


# Download squeezenet model
curl -LOk http://visualdl.bj.bcebos.com/squeezenet.tar.gz
#curl -LOk https://www.dropbox.com/s/fip3jzxsjf2g6zc/squeezenet.tar.gz?dl=0
tar -xvzf squeezenet.tar.gz
cp squeezenet/model.pb squeezenet_model.pb

rm -rf squeezenet
rm squeezenet.tar.gz

