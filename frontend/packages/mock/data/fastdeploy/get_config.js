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
            name: 'cls_pp',
            platform: 'ensemble',
            maxBatchSize: 128,
            input: [{name: 'x', dataType: 'TYPE_FP32', dims: ['3', '-1', '-1']}],
            output: [
                {name: 'cls_labels', dataType: 'TYPE_INT32', dims: ['1']},
                {name: 'cls_scores', dataType: 'TYPE_FP32', dims: ['1']}
            ],
            step: [
                {
                    modelName: 'cls_runtime',
                    modelVersion: '1',
                    inputMap: {x: 'x'},
                    outputMap: {'softmax_0.tmp_0': 'infer_output'},
                    modelType: 'normal',
                    inputModels: ['feed'],
                    outputModels: ['cls_postprocess'],
                    inputVars: ['x'],
                    outputVars: ['infer_output'],
                    pos_y: 1,
                    pos_x: 0
                },
                {
                    modelName: 'cls_postprocess',
                    modelVersion: '1',
                    inputMap: {POST_INPUT_0: 'infer_output'},
                    outputMap: {POST_OUTPUT_1: 'cls_scores', POST_OUTPUT_0: 'cls_labels'},
                    modelType: 'normal',
                    inputModels: ['cls_runtime'],
                    outputModels: ['fetch'],
                    inputVars: ['infer_output'],
                    outputVars: ['cls_scores', 'cls_labels'],
                    pos_y: 2,
                    pos_x: 0
                },
                {
                    modelName: 'feed',
                    modelType: 'virtual',
                    inputModels: [],
                    outputModels: ['cls_runtime'],
                    inputVars: [],
                    outputVars: ['x'],
                    pos_y: 0,
                    pos_x: 0
                },
                {
                    modelName: 'fetch',
                    modelType: 'virtual',
                    inputModels: ['cls_postprocess'],
                    outputModels: [],
                    inputVars: ['cls_scores', 'cls_labels'],
                    outputVars: [],
                    pos_y: 3,
                    pos_x: 0
                }
            ]
        },
        {
            name: 'pp_ocr',
            platform: 'ensemble',
            maxBatchSize: 1,
            input: [{name: 'INPUT', dataType: 'TYPE_UINT8', dims: ['-1', '-1', '3']}],
            output: [
                {name: 'rec_texts', dataType: 'TYPE_STRING', dims: ['-1', '1']},
                {name: 'rec_scores', dataType: 'TYPE_FP32', dims: ['-1', '1']}
            ],
            step: [
                {
                    modelName: 'det_preprocess',
                    modelVersion: '1',
                    inputMap: {INPUT_0: 'INPUT'},
                    outputMap: {OUTPUT_0: 'infer_input', OUTPUT_1: 'infos'},
                    modelType: 'normal',
                    inputModels: ['feed'],
                    outputModels: ['det_runtime', 'det_postprocess'],
                    inputVars: ['INPUT'],
                    outputVars: ['infer_input', 'infos'],
                    pos_y: 1,
                    pos_x: 0
                },
                {
                    modelName: 'det_runtime',
                    modelVersion: '1',
                    inputMap: {x: 'infer_input'},
                    outputMap: {'sigmoid_0.tmp_0': 'infer_output'},
                    modelType: 'normal',
                    inputModels: ['det_preprocess'],
                    outputModels: ['det_postprocess'],
                    inputVars: ['infer_input'],
                    outputVars: ['infer_output'],
                    pos_y: 2,
                    pos_x: 0
                },
                {
                    modelName: 'det_postprocess',
                    modelVersion: '1',
                    inputMap: {ORI_IMG: 'INPUT', POST_INPUT_1: 'infos', POST_INPUT_0: 'infer_output'},
                    outputMap: {POST_OUTPUT_0: 'rec_texts', POST_OUTPUT_1: 'rec_scores'},
                    modelType: 'normal',
                    inputModels: ['feed', 'det_preprocess', 'det_runtime'],
                    outputModels: ['fetch'],
                    inputVars: ['INPUT', 'infos', 'infer_output'],
                    outputVars: ['rec_texts', 'rec_scores'],
                    pos_y: 3,
                    pos_x: 0
                },
                {
                    modelName: 'feed',
                    modelType: 'virtual',
                    inputModels: [],
                    outputModels: ['det_postprocess', 'det_preprocess'],
                    inputVars: [],
                    outputVars: ['INPUT'],
                    pos_y: 0,
                    pos_x: 0
                },
                {
                    modelName: 'fetch',
                    modelType: 'virtual',
                    inputModels: ['det_postprocess'],
                    outputModels: [],
                    inputVars: ['rec_texts', 'rec_scores'],
                    outputVars: [],
                    pos_y: 4,
                    pos_x: 0
                }
            ]
        },
        {
            name: 'rec_pp',
            platform: 'ensemble',
            maxBatchSize: 128,
            input: [{name: 'x', dataType: 'TYPE_FP32', dims: ['3', '48', '-1']}],
            output: [
                {name: 'rec_texts', dataType: 'TYPE_STRING', dims: ['1']},
                {name: 'rec_scores', dataType: 'TYPE_FP32', dims: ['1']}
            ],
            step: [
                {
                    modelName: 'rec_runtime',
                    modelVersion: '1',
                    inputMap: {x: 'x'},
                    outputMap: {'softmax_5.tmp_0': 'infer_output'},
                    modelType: 'normal',
                    inputModels: ['feed'],
                    outputModels: ['rec_postprocess'],
                    inputVars: ['x'],
                    outputVars: ['infer_output'],
                    pos_y: 1,
                    pos_x: 0
                },
                {
                    modelName: 'rec_postprocess',
                    modelVersion: '1',
                    inputMap: {POST_INPUT_0: 'infer_output'},
                    outputMap: {POST_OUTPUT_0: 'rec_texts', POST_OUTPUT_1: 'rec_scores'},
                    modelType: 'normal',
                    inputModels: ['rec_runtime'],
                    outputModels: ['fetch'],
                    inputVars: ['infer_output'],
                    outputVars: ['rec_texts', 'rec_scores'],
                    pos_y: 2,
                    pos_x: 0
                },
                {
                    modelName: 'feed',
                    modelType: 'virtual',
                    inputModels: [],
                    outputModels: ['rec_runtime'],
                    inputVars: [],
                    outputVars: ['x'],
                    pos_y: 0,
                    pos_x: 0
                },
                {
                    modelName: 'fetch',
                    modelType: 'virtual',
                    inputModels: ['rec_postprocess'],
                    outputModels: [],
                    inputVars: ['rec_texts', 'rec_scores'],
                    outputVars: [],
                    pos_y: 3,
                    pos_x: 0
                }
            ]
        }
    ],
    models: [
        {
            name: 'rec_postprocess',
            maxBatchSize: 128,
            input: [{name: 'POST_INPUT_0', dataType: 'TYPE_FP32', dims: ['-1', '6625']}],
            output: [
                {name: 'POST_OUTPUT_0', dataType: 'TYPE_STRING', dims: ['1']},
                {name: 'POST_OUTPUT_1', dataType: 'TYPE_FP32', dims: ['1']}
            ],
            instanceGroup: [{count: 1, kind: 'KIND_CPU'}],
            backend: 'python',
            versions: [{title: '1', key: '1', children: [{title: 'model.py', key: 'model.py'}]}]
        },
        {
            name: 'det_preprocess',
            maxBatchSize: 1,
            input: [{name: 'INPUT_0', dataType: 'TYPE_UINT8', dims: ['-1', '-1', '3']}],
            output: [
                {name: 'OUTPUT_0', dataType: 'TYPE_FP32', dims: ['3', '-1', '-1']},
                {name: 'OUTPUT_1', dataType: 'TYPE_INT32', dims: ['4']}
            ],
            instanceGroup: [{count: 1, kind: 'KIND_CPU'}],
            backend: 'python',
            versions: [{title: '1', key: '1', children: [{title: 'model.py', key: 'model.py'}]}]
        },
        {
            name: 'rec_runtime',
            maxBatchSize: 128,
            input: [{name: 'x', dataType: 'TYPE_FP32', dims: ['3', '48', '-1']}],
            output: [{name: 'softmax_5.tmp_0', dataType: 'TYPE_FP32', dims: ['-1', '6625']}],
            instanceGroup: [{count: 1, gpus: [0], kind: 'KIND_GPU'}],
            backend: 'fastdeploy'
        },
        {
            name: 'det_runtime',
            maxBatchSize: 1,
            input: [{name: 'x', dataType: 'TYPE_FP32', dims: ['3', '-1', '-1']}],
            output: [{name: 'sigmoid_0.tmp_0', dataType: 'TYPE_FP32', dims: ['1', '-1', '-1']}],
            instanceGroup: [{count: 1, gpus: [0], kind: 'KIND_GPU'}],
            backend: 'fastdeploy'
        },
        {
            name: 'cls_runtime',
            maxBatchSize: 128,
            input: [{name: 'x', dataType: 'TYPE_FP32', dims: ['3', '-1', '-1']}],
            output: [{name: 'softmax_0.tmp_0', dataType: 'TYPE_FP32', dims: ['2']}],
            instanceGroup: [{count: 1, gpus: [0], kind: 'KIND_GPU'}],
            backend: 'fastdeploy'
        },
        {
            name: 'det_postprocess',
            maxBatchSize: 128,
            input: [
                {name: 'POST_INPUT_0', dataType: 'TYPE_FP32', dims: ['1', '-1', '-1']},
                {name: 'POST_INPUT_1', dataType: 'TYPE_INT32', dims: ['4']},
                {name: 'ORI_IMG', dataType: 'TYPE_UINT8', dims: ['-1', '-1', '3']}
            ],
            output: [
                {name: 'POST_OUTPUT_0', dataType: 'TYPE_STRING', dims: ['-1', '1']},
                {name: 'POST_OUTPUT_1', dataType: 'TYPE_FP32', dims: ['-1', '1']}
            ],
            instanceGroup: [{count: 1, kind: 'KIND_CPU'}],
            backend: 'python',
            versions: [{title: '1', key: '1', children: [{title: 'model.py', key: 'model.py'}]}]
        },
        {
            name: 'cls_postprocess',
            maxBatchSize: 128,
            input: [{name: 'POST_INPUT_0', dataType: 'TYPE_FP32', dims: ['2']}],
            output: [
                {name: 'POST_OUTPUT_0', dataType: 'TYPE_INT32', dims: ['1']},
                {name: 'POST_OUTPUT_1', dataType: 'TYPE_FP32', dims: ['1']}
            ],
            instanceGroup: [{count: 1, kind: 'KIND_CPU'}],
            backend: 'python',
            versions: [{title: '1', key: '1', children: [{title: 'model.py', key: 'model.py'}]}]
        }
    ]
};
