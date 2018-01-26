## VisualDL Graph Data Format Design

## Background
Neural network has a concept called  `Model`. VisualDL has an important feature that can visualize the structure of a deep learning `Model`. As a visualization tool, it tries to support various deep learning frameworks. It uses a generic `Model` data format that is supported by most of the frameworks.

Facebook has an open-source project called [ONNX](http://onnx.ai/)(Open Neural Network Exchange). ONNX is an open format that represents deep learning models. It is now officially supported by most popular frameworks such as Tensorflow, Caffe2, MxNet, PaddlePaddle Fluid, etc. So we decided to choose ONNX as the standard Model format and support the visualization of ONNX model.

## IR of ONNX
The description of ONNX IR can be found [here](https://github.com/onnx/onnx/blob/master/docs/IR.md). The most important part is the definition of [Graph](https://github.com/onnx/onnx/blob/master/docs/IR.md#graphs).

Each computation data flow graph is structured as a list of nodes that form the graph. Each node is called an operator. Nodes have zero or more inputs, one or more outputs, and zero or more attribute-value pairs.

## Rest API data format
Frontend uses rest API to get data from the server. The data format will be JSON. The data structure of a Graph is as below. Each Graph has three vectors:

- `node` represents Operator, it has type, input, and output.
- `input` represents input data or parameters, it has shape info.
- `output` represents output data of the graph, it has shape info.
- `edge` represents links in the graph, it has source, target and label.

```json
{
    "input": [
        {
            "data_type": "FLOAT",
            "name": "X",
            "shape": [
                "1"
            ]
        },
        {
            "data_type": "FLOAT",
            "name": "W1",
            "shape": [
                "1"
            ]
        },
        {
            "data_type": "FLOAT",
            "name": "B1",
            "shape": [
                "1"
            ]
        },
        {
            "data_type": "FLOAT",
            "name": "W2",
            "shape": [
                "1"
            ]
        },
        {
            "data_type": "FLOAT",
            "name": "B2",
            "shape": [
                "1"
            ]
        }
    ],
    "name": "MLP",
    "node": [
        {
            "input": [
                "X",
                "W1",
                "B1"
            ],
            "opType": "FC",
            "output": [
                "H1"
            ]
        },
        {
            "input": [
                "H1"
            ],
            "opType": "Relu",
            "output": [
                "R1"
            ]
        },
        {
            "input": [
                "R1",
                "W2",
                "B2"
            ],
            "opType": "FC",
            "output": [
                "Y"
            ]
        }
    ],
    "edge": [
        {"source": "X", "target": "1", "label": "label1"},
        {"source": "W1", "target": "1", "label": "label2"},
        {"source": "B1", "target": "1", "label": "label3"},
        {"source": "1", "target": "2", "label": "label4"},
        {"source": "2", "target": "3", "label": "label5"},
        {"source": "W2", "target": "3", "label": "label6"},
        {"source": "B2", "target": "3", "label": "label7"},
        {"source": "3", "target": "Y", "label": "label8"}
    ],
    "output": [
        {
            "data_type": "FLOAT",
            "name": "Y",
            "shape": [
                "1"
            ]
        }
    ]
}
```
