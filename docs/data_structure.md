# 数据格式抽象

初版需要支持如下几种基础组件：

- 基本组件
  - scalar
  - histogram
  - image
  - audio
  - text
- 高级组件
  - graph

下面将对这些组件的数据类型进行抽象。

# 宏观信息
后端的日志会在每个周期追加到 `logdir` 中相应的log文件中，在追加信息的过程中，
除了graph，其他所有组件均需要时间步等信息，依次下面列出这个过程必须的一些元信息：
- `step_id` 追加的时间步
- `UNIX time` 方便追踪速度
- `tag` 类似TF，每个参与可视化的信息来源必须有一个唯一的命名（可以系统自动生成）
  - tag会作为特定数据流从前端到后端统一的标识

# 各组件数据抽象
这里会抽象各组件数据必须存储的信息，为了便于沟通，使用了类似 `JSON` 的格式，
实际使用中，前后端可以自由选择数据格式，以及数据压缩。

## 抽样
每个 `tag` 会对应一个log文件，其中会包含全量信息（可以优化），但前端可视化并不需要全量信息，
这里后端就可以用 `蓄水池抽样` 来对全量数据进行抽样，组织好数据push给前端。

## 增量更新数据
考虑到前端可视化的动态更新，当前后端的全量数据应该只在第一次访问时才需要push给前端，
中间状态，后端前端交互的都只需要传递增量数据，具体增量数据格式类似

```javascript
[
  [
    "step_id": 200,
    "data": <data_type>
  ]
]
```


## 统一的数据表示
上述除了group之外的所有组件的数据，都可以用下述数据格式表示

```
[
  // data of each time-step
  [
    [
      "step_id": 12,
      "unix_time": 1234,
      "data": [0.1, 0.2, ...]
    ],
    // ... other steps
  ]
  // meta info
  [
    // one of image, text, audio, scalar or histogram
    "type": "image",
    "size": [320, 270],
    "tag": "some-name"
  ]
]
```

下面具体到单个组件，详细验证上述结构适用于每个组件

## scalar

```javascript
[
  // step_id is hidden in this array's offsets
  [
    "unix_time" : 23323,
    "data": 23
  ],
  [
    "unix_time" : 23325,
    "data": 13
  ]
]
```

当然，上面的数据格式在最终存储时，可以折叠为

```

[
  [23323, 23],
  [23325, 13]
]
```
这里只关注必要的信息，具体的优化暂不考虑，后续不再赘述。

## histogram
histogram 需要得到tensor的分布，因此会把完整的tensor 的数值存下，具体的分布可以后端实时（增量）计算

后端存储的数据格式

```javascript
[
  [
    "step_id": 12,
    "data": [0.12, 0.37, ...]
  ],
  [
    "step_id": 13,
    "data": [0.13, 0.38, ...]
  ]
]
```

后端会计算好每个时间步的数据分布push给前端，具体数据格式如下

```javascript
[
  [
    "step_id": 12,
    // n-dim distribution
    "data": [0.12, 0.23, ...]
  ]
]
```

## image
考虑到图像为 `RGB` 格式，会对应至多3个矩阵，每个图片存储的数据格式如下
```javascript
[
   "step_id": 12,
   "type": "RGB",
   "size": [345, 120],
   "data": [0.1, 0.2, ...]
]
```

## audio
采样会是出的音频数据会是一个数组，因此类似如下格式

```javascript
[
   "step_id": 12,
   "type": "audio",
   "size": [234],
   "data": [...]
]
```

## text
后端直接生成 text便可

```javascript
[
  "step_id": 12,
  "data": "xx" // some text here
]
```

## graph
graph 会复杂一些，可能无法借用上述类型

```javascript
[
  "nodes": [
    [
      [
        "name": "node1",
        "group": "scope1"
      ],
      [
        "name": "node2",
        "group": "scope2"
      ]
    ]
  ],
  // one edge
  [
    "from" : 0,
    "to": 1,
    "type": "normal"
  ],
  [
    "from" : 0,
    "to": 1,
    "type": "data"
  ]
]
```
