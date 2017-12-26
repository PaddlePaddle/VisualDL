## VisualDL Graph Data Format Design

## Background
Neural network has a concept called  `Model`. VisualDL has an important feature that visualizes the structure of a deep learning `Model`. As a visualization tool, it tries to support various deep learning frameworks. It uses a generic `Model` data format that is supported by most of the frameworks.

Facebook has an open-source project called [ONNX](http://onnx.ai/)(Open Neural Network Exchange). ONNX is an open format that represents deep learning models. It is now officially supported by most popular frameworks such as Tensorflow, Caffe2, MxNet, PaddlePaddle Fluid, etc. So we decided to choose ONNX as the standard Model format and support the visualization of ONNX model.

## IR of ONNX
The description of ONNX IR can be found [here](https://github.com/onnx/onnx/blob/master/docs/IR.md). The most important part is the definition of [Graph](https://github.com/onnx/onnx/blob/master/docs/IR.md#graphs).

Each computed data flow graph is structured as a list of nodes that form the graph. Each node is called an operator. Nodes have zero or more inputs, one or more outputs, and zero or more attribute-value pairs. 

## Rest API data format
Frontend uses rest API to get data from the server. The data format will be JSON. The data structure of a Graph is as below. Each Graph has three vectors:

- `node` represents Operator. It has type, input, and output.
- `input` represents input data or parameters, it has shape info.
- `output` represents output data of the graph, it has shape info.

```json
{
    "graph": {
        "nodes": [
            {
                "name": "op_1",
                "type": "mul_op",
                "input": [
                    "in1",
                    "w1"
                ],
                "output": [
                    "out1",
                    "out2"
                ]
            },
            {
                "name": "op_2",
                "type": "add_op",
                "input": [
                    "out1",
                    "b1"
                ],
                "output": [
                    "out3"
                ]
            }
        ],
        "inputs": [
            {
                "name": "in1",
                "shape": [
                    -1,
                    2
                ]
            },
            {
                "name": "b1",
                "shape": [
                    1,
                    3
                ]
            },
            {
                "name": "w1",
                "shape": [
                    2,
                    3
                ]
            }
        ],
        "outputs": [
            {
                "name": "out3",
                "shape": [
                    -1,
                    3
                ]
            }
        ]
    }
}
```



