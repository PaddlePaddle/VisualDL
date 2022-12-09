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

// export default {
//     ensembles: [
//         {
//             name: 'yolov5',
//             platform: 'ensemble',
//             maxBatchSize: 1,
//             input: [{name: 'INPUT', dataType: 'TYPE_UINT8', dims: ['-1', '-1', '3']}],
//             output: [{name: 'detction_result', dataType: 'TYPE_STRING', dims: ['-1']}],
//             versions: [{title: '1', key: '1', children: [{title: 'README.md', key: 'README.md'}]}],
//             step: [
//                 {
//                     modelName: 'preprocess',
//                     modelVersion: '1',
//                     inputMap: {INPUT_0: 'INPUT'},
//                     outputMap: {preprocess_output_1: 'postprocess_input_1', preprocess_output_0: 'infer_input'},
//                     modelType: 'normal',
//                     inputModels: ['feed', 'feed'],
//                     outputModels: ['postprocess', 'runtime'],
//                     inputVars: ['INPUT'],
//                     outputVars: ['postprocess_input_1', 'infer_input']
//                 },
//                 {
//                     modelName: 'runtime',
//                     modelVersion: '1',
//                     inputMap: {images: 'infer_input'},
//                     outputMap: {output: 'infer_output'},
//                     modelType: 'normal',
//                     inputModels: ['preprocess'],
//                     outputModels: ['postprocess'],
//                     inputVars: ['infer_input'],
//                     outputVars: ['infer_output']
//                 },
//                 {
//                     modelName: 'postprocess',
//                     modelVersion: '1',
//                     inputMap: {POST_INPUT_1: 'postprocess_input_1', POST_INPUT_0: 'infer_output'},
//                     outputMap: {POST_OUTPUT: 'detction_result'},
//                     modelType: 'normal',
//                     inputModels: ['preprocess', 'runtime'],
//                     outputModels: ['fetch', 'fetch'],
//                     inputVars: ['postprocess_input_1', 'infer_output'],
//                     outputVars: ['detction_result']
//                 },
//                 {
//                     modelName: 'feed',
//                     modelType: 'virtual',
//                     inputModels: [],
//                     outputModels: ['preprocess', 'preprocess'],
//                     inputVars: [],
//                     outputVars: ['INPUT', 'INPUT']
//                 },
//                 {
//                     modelName: 'fetch',
//                     modelType: 'virtual',
//                     inputModels: ['postprocess', 'postprocess'],
//                     outputModels: [],
//                     inputVars: ['detction_result', 'detction_result'],
//                     outputVars: []
//                 }
//             ]
//         },
//         {
//             name: 'yolov6',
//             platform: 'ensemble',
//             maxBatchSize: 1,
//             input: [{name: 'INPUT', dataType: 'TYPE_UINT8', dims: ['-1', '-1', '3']}],
//             output: [{name: 'detction_result', dataType: 'TYPE_STRING', dims: ['-1']}],
//             versions: [{title: '1', key: '1', children: [{title: 'README.md', key: 'README.md'}]}],
//             step: [
//                 {
//                     modelName: 'preprocess',
//                     modelVersion: '1',
//                     inputMap: {INPUT_0: 'INPUT'},
//                     outputMap: {preprocess_output_1: 'postprocess_input_1', preprocess_output_0: 'infer_input'},
//                     modelType: 'normal',
//                     inputModels: ['feed', 'feed'],
//                     outputModels: ['postprocess', 'runtime'],
//                     inputVars: ['INPUT'],
//                     outputVars: ['postprocess_input_1', 'infer_input']
//                 },
//                 {
//                     modelName: 'runtime',
//                     modelVersion: '1',
//                     inputMap: {images: 'infer_input'},
//                     outputMap: {output: 'infer_output'},
//                     modelType: 'normal',
//                     inputModels: ['preprocess'],
//                     outputModels: ['postprocess'],
//                     inputVars: ['infer_input'],
//                     outputVars: ['infer_output']
//                 },
//                 {
//                     modelName: 'postprocess',
//                     modelVersion: '1',
//                     inputMap: {POST_INPUT_1: 'postprocess_input_1', POST_INPUT_0: 'infer_output'},
//                     outputMap: {POST_OUTPUT: 'detction_result'},
//                     modelType: 'normal',
//                     inputModels: ['preprocess', 'runtime'],
//                     outputModels: ['fetch', 'fetch'],
//                     inputVars: ['postprocess_input_1', 'infer_output'],
//                     outputVars: ['detction_result']
//                 },
//                 {
//                     modelName: 'feed',
//                     modelType: 'virtual',
//                     inputModels: [],
//                     outputModels: ['preprocess', 'preprocess'],
//                     inputVars: [],
//                     outputVars: ['INPUT', 'INPUT']
//                 },
//                 {
//                     modelName: 'fetch',
//                     modelType: 'virtual',
//                     inputModels: ['postprocess', 'postprocess'],
//                     outputModels: [],
//                     inputVars: ['detction_result', 'detction_result'],
//                     outputVars: []
//                 }
//             ]
//         }
//     ],
//     models: [
//         {
//             name: 'postprocess',
//             input: [
//                 {name: 'POST_INPUT_0', dataType: 'TYPE_FP32', dims: ['-1', '-1', '-1']},
//                 {name: 'POST_INPUT_1', dataType: 'TYPE_STRING', dims: ['-1']}
//             ],
//             output: [{name: 'POST_OUTPUT', dataType: 'TYPE_STRING', dims: ['-1']}],
//             instanceGroup: [{count: 1, kind: 'KIND_CPU'}],
//             backend: 'python',
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
//         },
//         {
//             name: 'runtime',
//             maxBatchSize: 16,
//             input: [{name: 'images', dataType: 'TYPE_FP32', dims: ['3', '-1', '-1']}],
//             output: [{name: 'output', dataType: 'TYPE_FP32', dims: ['-1', '-1']}],
//             instanceGroup: [{count: 1, gpus: [0], kind: 'KIND_GPU'}],
//             backend: 'fastdeploy',
//             optimization: {gpuExecutionAccelerator: [{name: 'onnxruntime', parameters: {cpu_threads: '2'}}]},
//             versions: [
//                 {
//                     title: '1',
//                     key: '1',
//                     children: [
//                         {title: 'model.onnx', key: 'model.onnx'},
//                         {title: 'README.md', key: 'README.md'}
//                     ]
//                 }
//             ]
//         },
//         {
//             name: 'preprocess',
//             maxBatchSize: 1,
//             input: [{name: 'INPUT_0', dataType: 'TYPE_UINT8', dims: ['-1', '-1', '3']}],
//             output: [
//                 {name: 'preprocess_output_0', dataType: 'TYPE_FP32', dims: ['3', '-1', '-1']},
//                 {name: 'preprocess_output_1', dataType: 'TYPE_STRING', dims: ['-1']}
//             ],
//             instanceGroup: [{count: 1, kind: 'KIND_CPU'}],
//             backend: 'python',
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
export default {
    ensembles: [
        {
            name: 'ernie_seqcls',
            platform: 'ensemble',
            maxBatchSize: 64,
            input: [{name: 'INPUT', dataType: 'TYPE_STRING', dims: ['1']}],
            output: [
                {name: 'label', dataType: 'TYPE_INT64', dims: ['1']},
                {name: 'confidence', dataType: 'TYPE_FP32', dims: ['1']}
            ],
            versions: [{title: '1', key: '1', children: [{title: 'README.md', key: 'README.md'}]}],
            step: [
                {
                    modelName: 'ernie_tokenizer',
                    modelVersion: '1',
                    inputMap: {INPUT_0: 'INPUT'},
                    outputMap: {OUTPUT_0: 'tokenizer_input_ids', OUTPUT_1: 'tokenizer_token_type_ids'},
                    modelType: 'normal',
                    inputModels: ['feed'],
                    outputModels: ['ernie_seqcls_model'],
                    inputVars: ['INPUT'],
                    outputVars: ['tokenizer_input_ids', 'tokenizer_token_type_ids']
                },
                {
                    modelName: 'ernie_seqcls_model',
                    modelVersion: '1',
                    inputMap: {input_ids: 'tokenizer_input_ids', token_type_ids: 'tokenizer_token_type_ids'},
                    outputMap: {'linear_113.tmp_1': 'OUTPUT_2'},
                    modelType: 'normal',
                    inputModels: ['ernie_tokenizer'],
                    outputModels: ['ernie_seqcls_postprocess'],
                    inputVars: ['tokenizer_input_ids', 'tokenizer_token_type_ids'],
                    outputVars: ['OUTPUT_2']
                },
                {
                    modelName: 'ernie_seqcls_postprocess',
                    modelVersion: '1',
                    inputMap: {POST_INPUT: 'OUTPUT_2'},
                    outputMap: {POST_confidence: 'confidence', POST_label: 'label'},
                    modelType: 'normal',
                    inputModels: ['ernie_seqcls_model'],
                    outputModels: ['fetch'],
                    inputVars: ['OUTPUT_2'],
                    outputVars: ['confidence', 'label']
                },
                {
                    modelName: 'feed',
                    modelType: 'virtual',
                    inputModels: [],
                    outputModels: ['ernie_tokenizer'],
                    inputVars: [],
                    outputVars: ['INPUT']
                },
                {
                    modelName: 'fetch',
                    modelType: 'virtual',
                    inputModels: ['ernie_seqcls_postprocess'],
                    outputModels: [],
                    inputVars: ['confidence', 'label'],
                    outputVars: []
                }
            ]
        },
        {
            name: 'ernie_tokencls',
            platform: 'ensemble',
            maxBatchSize: 64,
            input: [{name: 'INPUT', dataType: 'TYPE_STRING', dims: ['1']}],
            output: [{name: 'OUTPUT', dataType: 'TYPE_STRING', dims: ['1']}],
            versions: [{title: '1', key: '1', children: [{title: 'README.md', key: 'README.md'}]}],
            step: [
                {
                    modelName: 'ernie_tokenizer',
                    modelVersion: '1',
                    inputMap: {INPUT_0: 'INPUT'},
                    outputMap: {OUTPUT_1: 'tokenizer_token_type_ids', OUTPUT_0: 'tokenizer_input_ids'},
                    modelType: 'normal',
                    inputModels: ['feed'],
                    outputModels: ['ernie_tokencls_model'],
                    inputVars: ['INPUT'],
                    outputVars: ['tokenizer_token_type_ids', 'tokenizer_input_ids']
                },
                {
                    modelName: 'ernie_tokencls_model',
                    modelVersion: '1',
                    inputMap: {input_ids: 'tokenizer_input_ids', token_type_ids: 'tokenizer_token_type_ids'},
                    outputMap: {'linear_113.tmp_1': 'OUTPUT_2'},
                    modelType: 'normal',
                    inputModels: ['ernie_tokenizer'],
                    outputModels: ['ernie_tokencls_postprocess'],
                    inputVars: ['tokenizer_token_type_ids', 'tokenizer_input_ids'],
                    outputVars: ['OUTPUT_2']
                },
                {
                    modelName: 'ernie_tokencls_postprocess',
                    modelVersion: '1',
                    inputMap: {POST_INPUT: 'OUTPUT_2'},
                    outputMap: {POST_OUTPUT: 'OUTPUT'},
                    modelType: 'normal',
                    inputModels: ['ernie_tokencls_model'],
                    outputModels: ['fetch'],
                    inputVars: ['OUTPUT_2'],
                    outputVars: ['OUTPUT']
                },
                {
                    modelName: 'feed',
                    modelType: 'virtual',
                    inputModels: [],
                    outputModels: ['ernie_tokenizer'],
                    inputVars: [],
                    outputVars: ['INPUT']
                },
                {
                    modelName: 'fetch',
                    modelType: 'virtual',
                    inputModels: ['ernie_tokencls_postprocess'],
                    outputModels: [],
                    inputVars: ['OUTPUT'],
                    outputVars: []
                }
            ]
        }
    ],
    models: [
        {
            maxBatchSize: 64,
            input: [
                {name: 'input_ids', dataType: 'TYPE_INT64', dims: ['-1']},
                {name: 'token_type_ids', dataType: 'TYPE_INT64', dims: ['-1']}
            ],
            output: [{name: 'linear_113.tmp_1', dataType: 'TYPE_FP32', dims: ['15']}],
            instanceGroup: [{count: 1, kind: 'KIND_CPU'}],
            backend: 'fastdeploy',
            name: 'ernie_seqcls_model',
            optimization: {cpuExecutionAccelerator: [{name: 'openvino', parameters: {cpu_threads: '5'}}]},
            versions: [
                {
                    title: '1',
                    key: '1',
                    children: [
                        {title: 'model.pdiparams', key: 'model.pdiparams'},
                        {title: 'model.pdmodel', key: 'model.pdmodel'},
                        {title: 'README.md', key: 'README.md'}
                    ]
                }
            ]
        },
        {
            name: 'ernie_seqcls_postprocess',
            maxBatchSize: 63,
            input: [{name: 'POST_INPUT', dataType: 'TYPE_FP32', dims: ['15']}],
            output: [
                {name: 'POST_label', dataType: 'TYPE_INT64', dims: ['1']},
                {name: 'POST_confidence', dataType: 'TYPE_FP32', dims: ['1']}
            ],
            instanceGroup: [{count: 1, kind: 'KIND_CPU'}],
            backend: 'python',
            optimization: {},
            versions: [{title: '1', key: '1', children: [{title: 'model.py', key: 'model.py'}]}]
        },
        {
            maxBatchSize: 64,
            input: [
                {name: 'input_ids', dataType: 'TYPE_INT64', dims: ['-1']},
                {name: 'token_type_ids', dataType: 'TYPE_INT64', dims: ['-1']}
            ],
            output: [{name: 'linear_113.tmp_1', dataType: 'TYPE_FP32', dims: ['-1', '7']}],
            instanceGroup: [{count: 1, kind: 'KIND_GPU'}],
            backend: 'fastdeploy',
            name: 'ernie_tokencls_model',
            optimization: {gpuExecutionAccelerator: [{name: 'paddle'}]},
            versions: [
                {
                    title: '1',
                    key: '1',
                    children: [
                        {title: 'model.pdiparams', key: 'model.pdiparams'},
                        {title: 'model.pdmodel', key: 'model.pdmodel'},
                        {title: 'README.md', key: 'README.md'}
                    ]
                }
            ]
        },
        {
            name: 'ernie_tokenizer',
            maxBatchSize: 64,
            input: [{name: 'INPUT_0', dataType: 'TYPE_STRING', dims: ['1']}],
            output: [
                {name: 'OUTPUT_0', dataType: 'TYPE_INT64', dims: ['-1']},
                {name: 'OUTPUT_1', dataType: 'TYPE_INT64', dims: ['-1']}
            ],
            instanceGroup: [{count: 1, kind: 'KIND_CPU'}],
            backend: 'python',
            versions: [{title: '1', key: '1', children: [{title: 'model.py', key: 'model.py'}]}]
        },
        {
            name: 'ernie_tokencls_postprocess',
            maxBatchSize: 64,
            input: [{name: 'POST_INPUT', dataType: 'TYPE_FP32', dims: ['-1', '7']}],
            output: [{name: 'POST_OUTPUT', dataType: 'TYPE_STRING', dims: ['1']}],
            instanceGroup: [{count: 1, kind: 'KIND_CPU'}],
            backend: 'python',
            versions: [{title: '1', key: '1', children: [{title: 'model.py', key: 'model.py'}]}]
        }
    ]
};
