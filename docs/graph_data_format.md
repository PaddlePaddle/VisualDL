## VisualDL Graph Data Format Design

## Background
Neural network has a concept of `Model`. VisualDL has a very important feature that it can visualize the structure of deep learning `Model`. As a visualization tool that wants to support many different deep learning frameworks, we should use a generic Model data format that is supported by most of the frameworks.

Facebook open-sourced an [ONNX](http://onnx.ai/)(Open Neural Network Exchange). ONNX is an open format to represent deep learning models. It now officially supported by world's most popular framework like Tensorflow, Caffe2, MxNet, PaddlePaddle Fluid, so we decided to choose ONNX as the standard Model format and support the visualization of ONNX model.

## IR of ONNX
The description of ONNX IR can be found [here](https://github.com/onnx/onnx/blob/master/docs/IR.md). The most important part is the definition of [Graph](https://github.com/onnx/onnx/blob/master/docs/IR.md#graphs).

Each computation data flow graph is structured as a list of nodes that form a graph. Each node is a call to an operator. Nodes have zero or more inputs, one or more outputs, and zero or more attribute-value pairs. 

## Rest API data format
Frontend use rest API to get data from the server, the data format will be JSON, the data structure of a Graph is as below. Each Graph will have three vectors inside:

- `node` represent Operator. It has type, input, and output.
- `input` represent input data or parameters, it has shape info.
- `output` represent output data of the graph, it has shape info.

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



