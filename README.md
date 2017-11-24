# VisualDL


### How to use
#### Step 1: build and install Python package
```shell
python setup.py bdist_wheel
cd dist
pip install visualdl-0.0.1-py2-none-any.whl
```

#### Step 2: build frontend
```shell
cd visualdl/frontend
npm install
npm run build
```

### Step 3: run
```
python bin/visual_dl.py --port=8888
```
