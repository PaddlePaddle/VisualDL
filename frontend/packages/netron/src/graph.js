export default {
    inputs:[{
        arguments:[
            {
                initializer:null,
                name:"save_infer_model/scale_0.tmp_1",
                type:{
                    dataType: "float32",
                    denotation: undefined,
                    shape:{
                        dimensions:["?",19,512,512]
                    }
                }    
            }
        ], //Array
        name:"0", //string
        visible: true //boolean
    }],
    name: "blocks[0]",
    nodes:[
        {
            attributes:[{
                name:'fuse_residual_connection',
                type:'boolean',
                value: false,
                visible: true
            }],
            chain:[],
            inputs:[{
                arguments:[
                    {
                        initializer:null,
                        name:"save_infer_model/scale_0.tmp_1",
                        type:{
                            dataType: "float32",
                            denotation: undefined,
                            shape:{
                                dimensions:["?",19,512,512]
                            }
                        }    
                    }
                ], //Array
                name:"0", //string
                visible: true //boolean
            }],
            metadata:{
                attributes:[
                    {name: 'workspace_size_MB', default: 4096},
                    {name: 'fuse_residual_connection', default: false}
                ],
                category: "Layer",
                name: "conv2d"
            },
            name:'',
            outputs:[{
                arguments:[
                    {
                        initializer:null,
                        name:"save_infer_model/scale_0.tmp_1",
                        type:{
                            dataType: "float32",
                            denotation: undefined,
                            shape:{
                                dimensions:["?",19,512,512]
                            }
                        }    
                    }
                ], //Array
                name:"0", //string
                visible: true //boolean
            }],
            childern:[ // chidern 为非叶子节点下的子节点
                {
                    attributes:[{
                        name:'fuse_residual_connection',
                        type:'boolean',
                        value: false,
                        visible: true
                    }],
                    chain:[],
                    inputs:'',
                    metadata:{
                        attributes:[
                            {name: 'workspace_size_MB', default: 4096},
                            {name: 'fuse_residual_connection', default: false}
                        ],
                        category: "Layer",
                        name: "conv2d"
                    },
                    name:'',
                    outputs:[{
                        arguments:[
                            {
                                initializer:null,
                                name:"save_infer_model/scale_0.tmp_1",
                                type:{
                                    dataType: "float32",
                                    denotation: undefined,
                                    shape:{
                                        dimensions:["?",19,512,512]
                                    }
                                }    
                            }
                        ], //Array
                        name:"0", //string
                        visible: true //boolean
                    }],
                    childern:[
                         {
        
                         }// 
                    ],
                    parent:'', // string
                    type:"conv2d"
                } 
            ],
            parent:'', // 节点的父节点
            type:"conv2d"
        }

    ],
    outputs: [
        {
            arguments:[
                {
                    initializer:null,
                    name:"save_infer_model/scale_0.tmp_1",
                    type:{
                        dataType: "float32",
                        denotation: undefined,
                        shape:{
                            dimensions:["?",19,512,512]
                        }
                    }    
                }
            ], //Array
            name:"0", //string
            visible: true //boolean
        }
    ]
}