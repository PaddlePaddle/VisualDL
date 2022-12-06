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
            name: 'runtime',
            backend: 'fastdeploy',
            max_batch_size: 8,
            versions: {
                1: ['model_1.pdmodels', 'model_1.pdiparams'],
                2: ['model_2.pdmodels', 'model_2.pdiparams']
            },
            input: [
                {
                    name: 'input0',
                    data_type: 'TYPE_FP32',
                    dims: [16]
                },
                {
                    name: 'input1',
                    data_type: 'TYPE_FP32',
                    dims: [16]
                }
            ],
            output: [
                {
                    name: 'input0',
                    data_type: 'TYPE_FP32',
                    dims: [16]
                },
                {
                    name: 'input1',
                    data_type: 'TYPE_FP32',
                    dims: [16]
                }
            ],
            instance_group: [
                {
                    count: 2,
                    kind: 'KIND_GPU',
                    gpus: [0]
                },
                {
                    count: 1,
                    kind: 'KIND_GPU',
                    gpus: [1, 2]
                }
            ],
            optimization: {
                cpu_execution_accelerator: [
                    {
                        name: 'onnxruntime',
                        params: {
                            cpu_threads: 8
                        }
                    }
                ],
                gpu_execution_accelerator: [
                    {
                        name: 'onnxruntime'
                    }
                ]
            }
        },
        {
            name: 'feed',
            backend: 'fastdeploy',
            max_batch_size: 8,
            versions: {
                1: ['model_1.pdmodels', 'model_1.pdiparams'],
                2: ['model_2.pdmodels', 'model_2.pdiparams']
            },
            input: [
                {
                    name: 'input0',
                    data_type: 'TYPE_FP32',
                    dims: [16]
                },
                {
                    name: 'input1',
                    data_type: 'TYPE_FP32',
                    dims: [16]
                }
            ],
            output: [
                {
                    name: 'input0',
                    data_type: 'TYPE_FP32',
                    dims: [16]
                },
                {
                    name: 'input1',
                    data_type: 'TYPE_FP32',
                    dims: [16]
                }
            ],
            instance_group: [
                {
                    count: 2,
                    kind: 'KIND_GPU',
                    gpus: [0]
                },
                {
                    count: 1,
                    kind: 'KIND_GPU',
                    gpus: [1, 2]
                }
            ],
            optimization: {
                cpu_execution_accelerator: [
                    {
                        name: 'onnxruntime',
                        params: {
                            cpu_threads: 8
                        }
                    }
                ],
                gpu_execution_accelerator: [
                    {
                        name: 'onnxruntime'
                    }
                ]
            }
        },
        {
            name: 'preprocess',
            backend: 'fastdeploy',
            max_batch_size: 8,
            versions: {
                1: ['model_1.pdmodels', 'model_1.pdiparams'],
                2: ['model_2.pdmodels', 'model_2.pdiparams']
            },
            input: [
                {
                    name: 'input0',
                    data_type: 'TYPE_FP32',
                    dims: [16]
                },
                {
                    name: 'input1',
                    data_type: 'TYPE_FP32',
                    dims: [16]
                }
            ],
            output: [
                {
                    name: 'input0',
                    data_type: 'TYPE_FP32',
                    dims: [16]
                },
                {
                    name: 'input1',
                    data_type: 'TYPE_FP32',
                    dims: [16]
                }
            ],
            instance_group: [
                {
                    count: 2,
                    kind: 'KIND_GPU',
                    gpus: [0]
                },
                {
                    count: 1,
                    kind: 'KIND_GPU',
                    gpus: [1, 2]
                }
            ],
            optimization: {
                cpu_execution_accelerator: [
                    {
                        name: 'onnxruntime',
                        params: {
                            cpu_threads: 8
                        }
                    }
                ],
                gpu_execution_accelerator: [
                    {
                        name: 'onnxruntime'
                    }
                ]
            }
        },
        {
            name: 'postprocess',
            backend: 'fastdeploy',
            max_batch_size: 8,
            versions: {
                1: ['model_1.pdmodels', 'model_1.pdiparams'],
                2: ['model_2.pdmodels', 'model_2.pdiparams']
            },
            input: [
                {
                    name: 'input0',
                    data_type: 'TYPE_FP32',
                    dims: [16]
                },
                {
                    name: 'input1',
                    data_type: 'TYPE_FP32',
                    dims: [16]
                }
            ],
            output: [
                {
                    name: 'input0',
                    data_type: 'TYPE_FP32',
                    dims: [16]
                },
                {
                    name: 'input1',
                    data_type: 'TYPE_FP32',
                    dims: [16]
                }
            ],
            instance_group: [
                {
                    count: 2,
                    kind: 'KIND_GPU',
                    gpus: [0]
                },
                {
                    count: 1,
                    kind: 'KIND_GPU',
                    gpus: [1, 2]
                }
            ],
            optimization: {
                cpu_execution_accelerator: [
                    {
                        name: 'onnxruntime',
                        params: {
                            cpu_threads: 8
                        }
                    }
                ],
                gpu_execution_accelerator: [
                    {
                        name: 'onnxruntime'
                    }
                ]
            }
        }
    ],
    emsembles: [
        {
            name: 'yolov5',
            platform: 'ensemble',
            max_batch_size: 1,
            versions: [
                {
                    title: '1',
                    key: '1'
                }
            ],
            input: [
                {
                    name: 'INPUT',
                    data_type: 'TYPE_UINT8',
                    dims: [-1, -1, 3]
                }
            ],
            output: [
                {
                    name: 'detction_result',
                    data_type: 'TYPE_STRING',
                    dims: [-1]
                }
            ],
            instance_group: [
                {
                    count: 2,
                    kind: 'KIND_GPU',
                    gpus: [0]
                },
                {
                    count: 1,
                    kind: 'KIND_GPU',
                    gpus: [100]
                }
            ],
            optimization: {
                cpu_execution_accelerator: [
                    {
                        name: 'onnxruntime',
                        params: {
                            cpu_threads: 8
                        }
                    }
                ],
                gpu_execution_accelerator: [
                    {
                        name: 'onnxruntime'
                    }
                ]
            },
            step: [
                {
                    modelName: 'feed',
                    modelType: 'virtual', // 虚拟节点
                    inputModels: [],
                    outputModels: ['preprocess'],
                    inputVars: [],
                    outputVars: ['INPUT']
                },
                {
                    modelName: 'preprocess',
                    modelVersion: '1',
                    modelType: 'normal', // 真实节点
                    inputModels: ['feed'],
                    outputModels: ['runtime', 'postprocess'],
                    inputVars: ['INPUT'],
                    outputVars: ['infer_input', 'postprocess_input_1'],
                    inputMap: {
                        INPUT_0: 'INPUT'
                    },
                    outputMap: {
                        preprocess_output_1: 'postprocess_input_1',
                        preprocess_output_0: 'infer_input'
                    }
                },
                {
                    modelName: 'runtime',
                    modelVersion: '1',
                    modelType: 'normal', // 真实节点
                    inputModels: ['preprocess'],
                    outputModels: ['postprocess'],
                    inputVars: ['infer_input'],
                    outputVars: ['infer_output'],
                    inputMap: {
                        images: 'infer_input'
                    },
                    outputMap: {
                        output: 'infer_output'
                    }
                },
                {
                    modelName: 'postprocess',
                    modelVersion: '1',
                    modelType: 'normal', // 真实节点
                    inputModels: ['feed', 'runtime'],
                    outputModels: ['fetch'],
                    inputVars: ['postprocess_input_1', 'infer_output'],
                    outputVars: ['detction_result'],
                    inputMap: {
                        POST_INPUT_1: 'postprocess_input_1',
                        POST_INPUT_0: 'infer_output'
                    },
                    outputMap: {
                        POST_OUTPUT: 'detction_result'
                    }
                },
                {
                    modelName: 'fetch',
                    modelType: 'virtual', // 虚拟节点
                    inputModels: ['postprocess'],
                    outputModels: [],
                    inputVars: ['detction_result'],
                    outputVars: []
                }
            ]
        }
    ],
    step: [
        {
            modelName: 'feed',
            modelType: 'virtual', // 虚拟节点
            inputModels: [],
            outputModels: ['preprocess'],
            inputVars: [],
            outputVars: ['INPUT']
        },
        {
            modelName: 'preprocess',
            modelVersion: '1',
            modelType: 'normal', // 真实节点
            inputModels: ['feed'],
            outputModels: ['runtime', 'postprocess'],
            inputVars: ['INPUT'],
            outputVars: ['infer_input', 'postprocess_input_1'],
            inputMap: {
                INPUT_0: 'INPUT'
            },
            outputMap: {
                preprocess_output_1: 'postprocess_input_1',
                preprocess_output_0: 'infer_input'
            }
        },
        {
            modelName: 'runtime',
            modelVersion: '1',
            modelType: 'normal', // 真实节点
            inputModels: ['preprocess'],
            outputModels: ['postprocess'],
            inputVars: ['infer_input'],
            outputVars: ['infer_output'],
            inputMap: {
                images: 'infer_input'
            },
            outputMap: {
                output: 'infer_output'
            }
        },
        {
            modelName: 'postprocess',
            modelVersion: '1',
            modelType: 'normal', // 真实节点
            inputModels: ['preprocess', 'runtime'],
            outputModels: ['fetch'],
            inputVars: ['postprocess_input_1', 'infer_output'],
            outputVars: ['detction_result'],
            inputMap: {
                POST_INPUT_1: 'postprocess_input_1',
                POST_INPUT_0: 'infer_output'
            },
            outputMap: {
                POST_OUTPUT: 'detction_result'
            }
        },
        {
            modelName: 'fetch',
            modelType: 'virtual', // 虚拟节点
            inputModels: ['postprocess'],
            outputModels: [],
            inputVars: ['detction_result'],
            outputVars: []
        }
    ]
};
