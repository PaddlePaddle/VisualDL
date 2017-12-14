# VisualDL


### How to use
#### Step 1: build frontend
```shell
cd frontend
npm install
npm run build
```

this step will generate a dist directory under frontend

### Step 2: copy frontend/dist to server/visualdl/frontend/dist
```shell
cp -r frontend/dist server/visualdl/frontend/
```

#### Step 3: build and install Python package
```shell
cd server/visualdl
python setup.py bdist_wheel
cd dist
pip install --upgrade visualdl-0.0.1-py2-none-any.whl
```


### Step 3: run
```
# cd to visualdl install dir
cd /usr/local/lib/python2.7/site-packages/visualdl/
python visual_dl.py --port=8888
```
