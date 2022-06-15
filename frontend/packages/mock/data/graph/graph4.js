export default {
    "version": "1.0.0",
    "nodes": [ 
    // {
    //    "name":"/", //该节点为辅助节点，用于帮忙构造完整的树结构
    //    "type":"",
    //    "parent_node" : "",
    //    "children_node" : ["Input", "MyNet", "Output"], 
    //    "input_nodes": [],
    //    "output_nodes": [],
    //    "input_vars": {},
    //    "output_vars": {},
    //    "attrs": {}
    // },
    {
       "name":"Input", 
       "type":"feed",
       "parent_node" : "root",
       "children_node" : [], 
       "input_nodes": [],
       "output_nodes": ["MyNet/FirstPart/conv1"],
       "input_vars": {},
       "output_vars": {"Out": ["Input:0"]},
       "attrs": {}
    },
    {
       "name":"MyNet", 
       "type":"",
       "parent_node" : "root",
       "children_node" : [
            {
                "name":"MyNet/FirstPart", 
                "type":"",
                "parent_node" : "MyNet",
                "children_node" : ["MyNet/FirstPart/conv1", "MyNet/FirstPart/relu1"], 
                "input_nodes": ["Input"],
                "output_nodes": ["MyNet/SecondPart/conv2", "MyNet/SecondPart/relu2"],
                "input_vars": {"X": ["Input:0"]},
                "output_vars": {"Y": ["MyNet/FirstPart/conv1:0", "MyNet/FirstPart/relu1:0"]},
                "label": "edge 边上的标识",
                "target": 
                "attrs": {}
            },

       ], 
       "input_nodes": ["Input"],
       "output_nodes": ["Output"],
       "input_vars": {"X": ["Input:0"]},
       "output_vars": {"Y": ["MyNet/SecondPart/relu2:0"]},
       "attrs": {}
    },
    {
       "name":"Output", 
       "type":"fetch",
       "parent_node" : "root",
       "children_node" : [], 
       "input_nodes": ["MyNet/SecondPart/relu2"],
       "output_nodes": [],
       "input_vars": {"X": ["MyNet/SecondPart/relu2:0"]},
       "output_vars": {"Out": ["Output:0"]},
       "attrs": {}
    },
    {
       "name":"MyNet/FirstPart", 
       "type":"",
       "parent_node" : "MyNet",
       "children_node" : ["MyNet/FirstPart/conv1", "MyNet/FirstPart/relu1"], 
       "input_nodes": ["Input"],
       "output_nodes": ["MyNet/SecondPart/conv2", "MyNet/SecondPart/relu2"],
       "input_vars": {"X": ["Input:0"]},
       "output_vars": {"Y": ["MyNet/FirstPart/conv1:0", "MyNet/FirstPart/relu1:0"]},
       "attrs": {}
    },
    {
       "name":"MyNet/SecondPart", 
       "type":"",
       "parent_node" : "MyNet",
       "children_node" : ["MyNet/SecondPart/conv2", "MyNet/SecondPart/relu2"], 
       "input_nodes": ["MyNet/FirstPart/conv1", "MyNet/FirstPart/relu1"],
       "output_nodes": ["Output"],
       "input_vars": {"X": ["MyNet/FirstPart/conv1:0", "MyNet/FirstPart/relu1:0"]},
       "output_vars": {"Y": ["MyNet/SecondPart/relu2:0"]},
       "attrs": {}
    },
    {
       "name":"MyNet/FirstPart/conv1", 
       "type":"Conv",
       "parent_node" : "MyNet/FirstPart/",
       "children_node" : [], 
       "input_nodes": ["Input"],
       "output_nodes": ["MyNet/FirstPart/relu1", "MyNet/SecondPart/conv2", "MyNet/SecondPart/relu2"],
       "input_vars": {"X": ["Input:0"]},
       "output_vars": {"Out": ["MyNet/FirstPart/conv1:0"]},
       "attrs": {}
    },
    {
       "name":"MyNet/FirstPart/relu1", 
       "type":"Relu",
       "parent_node" : "MyNet/FirstPart/",
       "children_node" : [], 
       "input_nodes": ["MyNet/FirstPart/conv1"],
       "output_nodes": ["MyNet/SecondPart/conv2", "MyNet/SecondPart/relu2"],
       "input_vars": {"X": ["MyNet/FirstPart/conv1:0"]},
       "output_vars": {"Out": ["MyNet/FirstPart/relu1:0"]},
       "attrs": {}
    },
    {
       "name":"MyNet/SecondPart/conv2", 
       "type":"Conv",
       "parent_node" : "MyNet/SecondPart",
       "children_node" : [], 
       "input_nodes": ["MyNet/FirstPart/conv1", "MyNet/FirstPart/relu1"],
       "output_nodes": ["MyNet/SecondPart/relu2"],
       "input_vars": {"X": ["MyNet/FirstPart/conv1:0", "MyNet/FirstPart/relu1:0"]},
       "output_vars": {"Out": ["MyNet/SecondPart/conv2:0"]},
       "attrs": {}
    },
    {
       "name":"MyNet/SecondPart/relu2", 
       "type":"Relu",
       "parent_node" : "MyNet/SecondPart",
       "children_node" : [], 
       "input_nodes": ["MyNet/FirstPart/conv1", "MyNet/FirstPart/relu1", "MyNet/SecondPart/conv2"],
       "output_nodes": ["Output"],
       "input_vars": {"X": ["MyNet/FirstPart/conv1:0", "MyNet/FirstPart/relu1:0", "MyNet/SecondPart/conv2:0"]},
       "output_vars": {"Out": ["MyNet/SecondPart/relu2:0"]},
       "attrs": {}
    }
    ],
    "vars":  [ 
    {
        "name": "Input:0",
        "type": "",
        "shape": [1, 3, 64, 64],
        "dtype": "float32",
        "value": [],
        "from_node": "Input",
        "to_nodes": ["MyNet/FirstPart/conv1"],
        "attrs": {}
    },
    {
        "name": "MyNet/FirstPart/conv1:0",
        "type": "",
        "shape": [1, 256, 64, 64],
        "dtype": "float32",
        "value": [],
        "from_node": "MyNet/FirstPart/conv1",
        "to_nodes": ["MyNet/FirstPart/relu1", "MyNet/SecondPart/conv2", "MyNet/SecondPart/relu2"],
        "attrs": {}
    },
    {
        "name": "MyNet/FirstPart/relu1:0",
        "type": "",
        "shape": [1, 256, 64, 64],
        "dtype": "float32",
        "value": [],
        "from_node": "MyNet/FirstPart/relu1",
        "to_nodes": ["MyNet/SecondPart/conv2", "MyNet/SecondPart/relu2"],
        "attrs": {}
    },
    {
        "name": "MyNet/SecondPart/conv2:0",
        "type": "",
        "shape": [1, 256, 64, 64],
        "dtype": "float32",
        "value": [],
        "from_node": "MyNet/SecondPart/conv2",
        "to_nodes": ["MyNet/SecondPart/relu2"],
        "attrs": {}
    },
    {
        "name": "MyNet/SecondPart/relu2:0",
        "type": "",
        "shape": [1, 256, 64, 64],
        "dtype": "float32",
        "value": [],
        "from_node": "MyNet/SecondPart/relu2",
        "to_nodes": ["Output"],
        "attrs": {}
    },
    {
        "name": "Output:0",
        "type": "",
        "shape": [1, 3, 64, 64],
        "dtype": "float32",
        "value": [],
        "from_node": "Output",
        "to_nodes": [],
        "attrs": {}
    }    
    ]
}