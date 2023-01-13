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
    'ensemble-img':
        'data:image/png;base64,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o44q21vZHnzwQfn000/lX//6V6WCxUrFzp07y5lnnin9+vWr1HvZxcuOAEs3yrR1YNlvYWeUB4EHHnhAXnrpJXnjjTekSZMm5blUiXNbtmwpHTt2lJ49e5bpmlVFHDk5OXLyyScrcTzxxBNlKqNlrhoEjDiqBudtugsPH7Jib5dddtmm8+OdBHF06tRJbrrppjJdt6qIg0KtWbNGatWqpY91W0o/BIw4ylkn7FcydOhQ+eijj7STN2/eXG688Ub9JL388suyYMECOeuss+TJJ5+U77//Xp5//nn573//K999951ccMEFMmrUKPn3v/+tqgJpTscmffLJJ6o4nnnmmUgHysrKkocfflhmz54tO+20k+a95ZZbZM89E+/UhdvzzjvvyJdffikNGjSQRo0ayTnnnKNuAQkbcIsoy/777y9nnHGGqhIebiLFIo5x48bJu+++K926dVOFkAiPr776SkaMGCF9+vSRp59+WubMmSN169aVrl276jXcng9gCGZt2rSRhx56SBYuXLhVTbGeYMyYMfr/RLjEqweHdTmbQeBON+IoR5XzcGCHDh2UDPg88MAD1a1YtGiR0KGOPvpo7Wwvvvii3oWOxZPHF110kbz99tv6f0ZVziXO9NprrwkByM8++0yJYMKECXLXXXfJ/PnzddEN8+etW7dWwqCz42tyDum9996TREHuL774QubOnavyn7LRaZo1ayatWrWS119/Xe644w4tIx2WKTc6+LHHHitjx47VpyKjiYMYzODBg+Waa66Rvn376v4tifD48MMPlVhJ5557rvzP//yP3vunn36SkSNHyumnn66/Ub6rrrpKbrjhBpk0aZL89ttvkZpauXKlTJw4UYkWvJPBJV49cH9LZUfAiKPsmEXOoNHefvvtMnr0aDn11FP1/3Qevh900EE6GroG26NHD+nVq1fkXPd/Oh6jKgnCuPrqq3WEhVyiieO2226TN998U2bNmiX16tXTc+g0p512mo7g1113XVLWRLsq69evl//93/+VY445RlWAG/UJgqI4hg0bJuedd14J4qCTDx8+XG3CNlIyeDjiaNeunRDDIeGWHHfccXLhhReqmoomDq9RkDVENW/ePJk8ebKwBikZXOLVQ1KAWaatEDDiKEejwK2YOnWqfPzxx/rEoEuMxKgJlALEwPcPPvigxMyIa8h0AB4aIvGwITMd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559/XjtessmII1mkEud744035Pbbb5d58+bp2gJLVYdAIIiDZ3B4HqciG5cjjhdeeEFOPPHEpGvMiCNpqBJmdMTx7bffqrtlqeoQSBvi+Pzzz2XUqFEyd+5c2X///eXMM8+Unj176ko1EiNLkyZNZOPGjTJ27FhdIj958mS544475IorrpBPPvlEPvroI82LEujfv7/UqlVL/+a6uCq33nqr/o2b8eKLLwoNb9GiRXLUUUdJ+/bt5eKLL04K+XvuuUfmz58v33//vRx22GFCjOjmm2+WY445Ru8zePBgmTFjhpbxyCOPlF69esnRRx+t145FHDxEdNddd6mtDz/8sHYCYg98nz17tv6NqrnlllsisQjw4N48ZzRx4kRVVNz/zjvvlP32+/tta5Rz2LBh8s0330Rwbdu2rey9995anmhX5f3335f33ntPPvvsM10UeN5550mnTp3UxkTpq6++Uqwp26OPPipz5sxRV65169Zy7bXX6gNSLhHnGTp0qObBvhNOOEHrxwXqkcOvvvqquiJg8I9//ENQju3atdM2cN1118nKlSvll19+kWOPPVavPXLkSHnwwQeVyPntzTfflN9++01x4doHH3yw3p5yjhgxQuvsueeek2nTpmlbu+GGGxLWnyv/lClT1PWlDbRq1UpOP/10adOmje5jQWIfG+yjTdIOmjdvLjfeeKN+kkqzz+FUnrpIVFfl/T0tiIOK69Gjh1Zsx44d5YcffpDXX39dK+SZZ56JNHAawfr167XxoCA4B/+WROe/4IILlEAgocsvv1wbMKlPnz4aCX7llVf070GDBsmYMWP0+qeddppMnz5dOzod86qrrkqI6WuvvSb/+c9/5OWXX9bG0qhRIzn33HM11kEnWbVqlTYSVtjReL/88kttoDT+aOLIycmRyy67TBsX5TvggAN0npzr0KE6d+6sjYx7kujUdGI6vAuydunSRZYsWaKYQSZvvfWWdiQkfIcOHRQbPln1N378eG3ckC7E6iUOcCAeRAelI9ApIVjOdaRbGjgffvih2u2uCxksXLhQnn32WaGMAwcO1NMha3CjrF27dlX7nn76acWAzkKg1tXRNddcI4cccohiOGnSJCWmk046SfN/9913Wm+QCIuSrr76am0btBOeqaB98FwFNmA7dQGpest54IEHKj5NmzZVuxPVH+Vn4Lr//vsFAqZO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',
    models: [
        {
            name: 'postprocess',
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
                },
                {
                    title: '2',
                    key: '2',
                    children: [
                        {
                            title: '__pycache__',
                            key: '__pycache__2'
                        },
                        {
                            title: 'model.py',
                            key: 'model.py2'
                        }
                    ]
                }
            ]
        },
        {
            name: 'runtime',
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
