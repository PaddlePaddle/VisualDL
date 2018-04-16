# Download squeezenet model
#curl -LOk http://visualdl.bj.bcebos.com/squeezenet.tar.gz
curl -LOk https://www.dropbox.com/s/fip3jzxsjf2g6zc/squeezenet.tar.gz
tar -xvzf squeezenet.tar.gz
cp squeezenet/model.pb squeezenet_model.pb

rm -rf squeezenet
rm squeezenet.tar.gz
