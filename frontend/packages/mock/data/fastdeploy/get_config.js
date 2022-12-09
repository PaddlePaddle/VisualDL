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
    ensembles: [
        {
            name: 'yolov5',
            platform: 'ensemble',
            maxBatchSize: 1,
            input: [{name: 'INPUT', dataType: 'TYPE_UINT8', dims: ['-1', '-1', '3']}],
            output: [{name: 'detction_result', dataType: 'TYPE_STRING', dims: ['-1']}],
            versions: [{title: '1', key: '1', children: [{title: 'README.md', key: 'README.md'}]}],
            step: [
                {
                    modelName: 'preprocess',
                    modelVersion: '1',
                    inputMap: {INPUT_0: 'INPUT'},
                    outputMap: {preprocess_output_1: 'postprocess_input_1', preprocess_output_0: 'infer_input'},
                    modelType: 'normal',
                    inputModels: ['feed', 'feed'],
                    outputModels: ['postprocess', 'runtime'],
                    inputVars: ['INPUT'],
                    outputVars: ['postprocess_input_1', 'infer_input']
                },
                {
                    modelName: 'runtime',
                    modelVersion: '1',
                    inputMap: {images: 'infer_input'},
                    outputMap: {output: 'infer_output'},
                    modelType: 'normal',
                    inputModels: ['preprocess'],
                    outputModels: ['postprocess'],
                    inputVars: ['infer_input'],
                    outputVars: ['infer_output']
                },
                {
                    modelName: 'postprocess',
                    modelVersion: '1',
                    inputMap: {POST_INPUT_1: 'postprocess_input_1', POST_INPUT_0: 'infer_output'},
                    outputMap: {POST_OUTPUT: 'detction_result'},
                    modelType: 'normal',
                    inputModels: ['preprocess', 'runtime'],
                    outputModels: ['fetch', 'fetch'],
                    inputVars: ['postprocess_input_1', 'infer_output'],
                    outputVars: ['detction_result']
                },
                {
                    modelName: 'feed',
                    modelType: 'virtual',
                    inputModels: [],
                    outputModels: ['preprocess', 'preprocess'],
                    inputVars: [],
                    outputVars: ['INPUT', 'INPUT']
                },
                {
                    modelName: 'fetch',
                    modelType: 'virtual',
                    inputModels: ['postprocess', 'postprocess'],
                    outputModels: [],
                    inputVars: ['detction_result', 'detction_result'],
                    outputVars: []
                }
            ]
        },
        {
            name: 'yolov6',
            platform: 'ensemble',
            maxBatchSize: 1,
            input: [{name: 'INPUT', dataType: 'TYPE_UINT8', dims: ['-1', '-1', '3']}],
            output: [{name: 'detction_result', dataType: 'TYPE_STRING', dims: ['-1']}],
            versions: [{title: '1', key: '1', children: [{title: 'README.md', key: 'README.md'}]}],
            step: [
                {
                    modelName: 'preprocess',
                    modelVersion: '1',
                    inputMap: {INPUT_0: 'INPUT'},
                    outputMap: {preprocess_output_1: 'postprocess_input_1', preprocess_output_0: 'infer_input'},
                    modelType: 'normal',
                    inputModels: ['feed', 'feed'],
                    outputModels: ['postprocess', 'runtime'],
                    inputVars: ['INPUT'],
                    outputVars: ['postprocess_input_1', 'infer_input']
                },
                {
                    modelName: 'runtime',
                    modelVersion: '1',
                    inputMap: {images: 'infer_input'},
                    outputMap: {output: 'infer_output'},
                    modelType: 'normal',
                    inputModels: ['preprocess'],
                    outputModels: ['postprocess'],
                    inputVars: ['infer_input'],
                    outputVars: ['infer_output']
                },
                {
                    modelName: 'postprocess',
                    modelVersion: '1',
                    inputMap: {POST_INPUT_1: 'postprocess_input_1', POST_INPUT_0: 'infer_output'},
                    outputMap: {POST_OUTPUT: 'detction_result'},
                    modelType: 'normal',
                    inputModels: ['preprocess', 'runtime'],
                    outputModels: ['fetch', 'fetch'],
                    inputVars: ['postprocess_input_1', 'infer_output'],
                    outputVars: ['detction_result']
                },
                {
                    modelName: 'feed',
                    modelType: 'virtual',
                    inputModels: [],
                    outputModels: ['preprocess', 'preprocess'],
                    inputVars: [],
                    outputVars: ['INPUT', 'INPUT']
                },
                {
                    modelName: 'fetch',
                    modelType: 'virtual',
                    inputModels: ['postprocess', 'postprocess'],
                    outputModels: [],
                    inputVars: ['detction_result', 'detction_result'],
                    outputVars: []
                }
            ]
        }
    ],
    models: [
        {
            name: 'postprocess',
            input: [
                {name: 'POST_INPUT_0', dataType: 'TYPE_FP32', dims: ['-1', '-1', '-1']},
                {name: 'POST_INPUT_1', dataType: 'TYPE_STRING', dims: ['-1']}
            ],
            output: [{name: 'POST_OUTPUT', dataType: 'TYPE_STRING', dims: ['-1']}],
            instanceGroup: [{count: 1, kind: 'KIND_CPU'}],
            backend: 'python',
            versions: [
                {
                    title: '1',
                    key: '1',
                    children: [
                        {title: '__pycache__', key: '__pycache__'},
                        {title: 'model.py', key: 'model.py'}
                    ]
                }
            ]
        },
        {
            name: 'runtime',
            maxBatchSize: 16,
            input: [{name: 'images', dataType: 'TYPE_FP32', dims: ['3', '-1', '-1']}],
            output: [{name: 'output', dataType: 'TYPE_FP32', dims: ['-1', '-1']}],
            instanceGroup: [{count: 1, gpus: [0], kind: 'KIND_GPU'}],
            backend: 'fastdeploy',
            optimization: {gpuExecutionAccelerator: [{name: 'onnxruntime', parameters: {cpu_threads: '2'}}]},
            versions: [
                {
                    title: '1',
                    key: '1',
                    children: [
                        {title: 'model.onnx', key: 'model.onnx'},
                        {title: 'README.md', key: 'README.md'}
                    ]
                }
            ]
        },
        {
            name: 'preprocess',
            maxBatchSize: 1,
            input: [{name: 'INPUT_0', dataType: 'TYPE_UINT8', dims: ['-1', '-1', '3']}],
            output: [
                {name: 'preprocess_output_0', dataType: 'TYPE_FP32', dims: ['3', '-1', '-1']},
                {name: 'preprocess_output_1', dataType: 'TYPE_STRING', dims: ['-1']}
            ],
            instanceGroup: [{count: 1, kind: 'KIND_CPU'}],
            backend: 'python',
            versions: [
                {
                    title: '1',
                    key: '1',
                    children: [
                        {title: '__pycache__', key: '__pycache__'},
                        {title: 'model.py', key: 'model.py'}
                    ]
                }
            ]
        }
    ]
};
