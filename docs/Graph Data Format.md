## VisualDL Graph data format design

## Backgroud
Neural network have a concept of `Model`. VisualDL has a very import feature that it can visualize the structure of deep learning `Model`. As an visualize tool that want to support many different deeplearning framework, we should use a generic Model data format that is supported by most of frameworks.

Facebook opensourced a [ONNX](http://onnx.ai/)(Open Neural Network Exchange). ONNX is a open format to represent deep learning models. It now officially supported by world's most popular framework like Tensorflow, Caffe2, MxNet, PaddlePaddle Fluid, so we decided to choose ONNX as the standard Model format and support the visualization of ONNX model.

## IR of ONNX
The dscription of ONNX IR can be found [here](https://github.com/onnx/onnx/blob/master/docs/IR.md). The most important part is the defination of [Graph](https://github.com/onnx/onnx/blob/master/docs/IR.md#graphs).

Each computation dataflow graph is structured as a list of nodes that form a graph. Each node is a call to an operator. Nodes have zero or more inputs, one or more outputs, and zero or more attribute-value pairs. 

## Rest API data format
Frontend use rest api to get data from server, the data format will be json, the data structure of a Graph is as below. Each Graph will have three vector inside:

- `node` represent Operator. It have type, input and output.
- `input` represent input datas or parameters, it have shape info.
- `output` represent output data of the graph, it have shape info.

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



