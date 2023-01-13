/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export default {
    models: [
        {
            name: 'postprocess',
            config_filenames: 'config.pbtxt',
            input: [
                {
                    name: 'POST_INPUT_0',
                    dataType: 'TYPE_FP32',
                    dims: ['-1', '-1', '-1']
                },
                {
                    name: 'POST_INPUT_1',
                    dataType: 'TYPE_STRING',
                    dims: ['-1']
                }
            ],
            output: [
                {
                    name: 'POST_OUTPUT',
                    dataType: 'TYPE_STRING',
                    dims: ['-1']
                }
            ],
            instanceGroup: [
                {
                    count: 1,
                    kind: 'KIND_CPU'
                }
            ],
            backend: 'python',
            versions: [
                {
                    title: '1',
                    key: '1',
                    children: [
                        {
                            title: '__pycache__',
                            key: '__pycache__'
                        },
                        {
                            title: 'model.py',
                            key: 'model.py'
                        }
                    ]
                }
            ]
        },
        {
            name: 'runtime',
            config_filenames: 'config.pbtxt',
            maxBatchSize: 16,
            input: [
                {
                    name: 'images',
                    dataType: 'TYPE_FP32',
                    dims: ['3', '-1', '-1']
                }
            ],
            output: [
                {
                    name: 'output',
                    dataType: 'TYPE_FP32',
                    dims: ['-1', '-1']
                }
            ],
            instanceGroup: [
                {
                    count: 1,
                    gpus: [0],
                    kind: 'KIND_GPU'
                }
            ],
            backend: 'fastdeploy',
            optimization: {
                gpuExecutionAccelerator: [
                    {
                        name: 'onnxruntime',
                        parameters: {
                            cpu_threads: '2'
                        }
                    }
                ]
            },
            versions: [
                {
                    title: '1',
                    key: '1',
                    children: [
                        {
                            title: 'model.onnx',
                            key: 'model.onnx'
                        },
                        {
                            title: 'README.md',
                            key: 'README.md'
                        }
                    ]
                }
            ]
        },
        {
            name: 'preprocess',
            config_filenames: 'config.pbtxt',
            maxBatchSize: 1,
            input: [
                {
                    name: 'INPUT_0',
                    dataType: 'TYPE_UINT8',
                    dims: ['-1', '-1', '3']
                }
            ],
            output: [
                {
                    name: 'preprocess_output_0',
                    dataType: 'TYPE_FP32',
                    dims: ['3', '-1', '-1']
                },
                {
                    name: 'preprocess_output_1',
                    dataType: 'TYPE_STRING',
                    dims: ['-1']
                }
            ],
            instanceGroup: [
                {
                    count: 1,
                    kind: 'KIND_CPU'
                }
            ],
            backend: 'python',
            versions: [
                {
                    title: '1',
                    key: '1',
                    children: [
                        {
                            title: '__pycache__',
                            key: '__pycache__'
                        },
                        {
                            title: 'model.py',
                            key: 'model.py'
                        }
                    ]
                }
            ]
        }
    ],
    ensembles: [
        {
            name: 'yolov5',
            config_filenames: 'config.pbtxt',
            platform: 'ensemble',
            maxBatchSize: 1,
            input: [
                {
                    name: 'INPUT',
                    dataType: 'TYPE_UINT8',
                    dims: ['-1', '-1', '3']
                }
            ],
            output: [
                {
                    name: 'detction_result',
                    dataType: 'TYPE_STRING',
                    dims: ['-1']
                }
            ],
            versions: [
                {
                    title: '1',
                    key: '1',
                    children: [
                        {
                            title: 'README.md',
                            key: 'README.md'
                        }
                    ]
                }
            ],
            step: [
                {
                    modelName: 'preprocess',
                    modelVersion: '1',
                    inputMap: {
                        INPUT_0: 'INPUT'
                    },
                    outputMap: {
                        preprocess_output_1: 'postprocess_input_1',
                        preprocess_output_0: 'infer_input'
                    },
                    modelType: 'normal',
                    inputModels: ['feed'],
                    pos_x: 0,
                    pos_y: 1,
                    outputModels: ['postprocess', 'runtime'],
                    inputVars: ['INPUT'],
                    outputVars: ['postprocess_input_1', 'infer_input']
                },
                {
                    modelName: 'runtime',
                    modelVersion: '1',
                    inputMap: {
                        images: 'infer_input'
                    },
                    outputMap: {
                        output: 'infer_output'
                    },
                    modelType: 'normal',
                    inputModels: ['preprocess'],
                    outputModels: ['postprocess'],
                    inputVars: ['infer_input'],
                    outputVars: ['infer_output'],
                    pos_x: 0,
                    pos_y: 2
                },
                {
                    modelName: 'postprocess',
                    modelVersion: '1',
                    inputMap: {
                        POST_INPUT_0: 'infer_output',
                        POST_INPUT_1: 'postprocess_input_1'
                    },
                    outputMap: {
                        POST_OUTPUT: 'detction_result'
                    },
                    modelType: 'normal',
                    inputModels: ['preprocess', 'runtime'],
                    outputModels: ['fetch'],
                    inputVars: ['postprocess_input_1', 'infer_output'],
                    outputVars: ['detction_result'],
                    pos_x: 0,
                    pos_y: 3
                },
                {
                    modelName: 'feed',
                    modelType: 'virtual',
                    inputModels: [],
                    outputModels: ['preprocess'],
                    inputVars: [],
                    outputVars: ['INPUT'],
                    pos_x: 0,
                    pos_y: 0
                },
                {
                    modelName: 'fetch',
                    modelType: 'virtual',
                    inputModels: ['postprocess'],
                    outputModels: [],
                    inputVars: ['detction_result'],
                    outputVars: [],
                    pos_x: 0,
                    pos_y: 5
                }
            ]
        }
    ]
};
// export default {
//     ensembles: [],
//     models: [
//         {
//             name: 'uie',
//             maxBatchSize: 1,
//             input: [
//                 {name: 'INPUT_0', dataType: 'TYPE_STRING', dims: ['1']},
//                 {name: 'INPUT_1', dataType: 'TYPE_STRING', dims: ['1']}
//             ],
//             output: [{name: 'OUTPUT_0', dataType: 'TYPE_STRING', dims: ['1']}],
//             instanceGroup: [{count: 1, gpus: [0], kind: 'KIND_GPU'}],
//             backend: 'python',
//             config_filenames: 'config.pbtxt',
//             optimization: {gpuExecutionAccelerator: [{name: 'paddle', parameters: {cpu_threads: '12'}}]},
//             versions: [
//                 {
//                     title: '1',
//                     key: '1',
//                     children: [
//                         {title: '__pycache__', key: '__pycache__'},
//                         {title: 'model.py', key: 'model.py'}
//                     ]
//                 }
//             ]
//         }
//     ]
// };
