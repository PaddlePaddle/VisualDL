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

export default `I1201 03:40:58.374595 9800 metrics.cc:298] Collecting metrics for GPU 0: Tesla P40
I1201 03:40:58.374853 9800 metrics.cc:298] Collecting metrics for GPU 1: Tesla P40
I1201 03:40:58.374873 9800 metrics.cc:298] Collecting metrics for GPU 2: Tesla P40
I1201 03:40:58.374886 9800 metrics.cc:298] Collecting metrics for GPU 3: Tesla P40
I1201 03:40:58.374900 9800 metrics.cc:298] Collecting metrics for GPU 4: Tesla P40
I1201 03:40:58.374918 9800 metrics.cc:298] Collecting metrics for GPU 5: Tesla P40
I1201 03:40:58.374930 9800 metrics.cc:298] Collecting metrics for GPU 6: Tesla P40
I1201 03:40:58.609011 9800 pinned_memory_manager.cc:240] Pinned memory pool is created at '0x7f8a30000000' with size 268435456
I1201 03:40:58.614426 9800 cuda_memory_manager.cc:105] CUDA memory pool is created on device 0 with size 67108864
I1201 03:40:58.614439 9800 cuda_memory_manager.cc:105] CUDA memory pool is created on device 1 with size 67108864
I1201 03:40:58.614444 9800 cuda_memory_manager.cc:105] CUDA memory pool is created on device 2 with size 67108864
I1201 03:40:58.614449 9800 cuda_memory_manager.cc:105] CUDA memory pool is created on device 3 with size 67108864
I1201 03:40:58.614455 9800 cuda_memory_manager.cc:105] CUDA memory pool is created on device 4 with size 67108864
I1201 03:40:58.614460 9800 cuda_memory_manager.cc:105] CUDA memory pool is created on device 5 with size 67108864
I1201 03:40:58.614466 9800 cuda_memory_manager.cc:105] CUDA memory pool is created on device 6 with size 67108864
I1201 03:40:59.361506 9800 model_repository_manager.cc:1022] loading: postprocess:1
I1201 03:40:59.461702 9800 model_repository_manager.cc:1022] loading: preprocess:1
I1201 03:40:59.467941 9800 python.cc:1875] TRITONBACKEND_ModelInstanceInitialize: postprocess_0 (CPU device 0)
I1201 03:40:59.561977 9800 model_repository_manager.cc:1022] loading: runtime:1
I1201 03:41:00.121725 9800 model_repository_manager.cc:1183] successfully loaded 'postprocess' version 1
I1201 03:41:00.455908 9800 fastdeploy_runtime.cc:1166] TRITONBACKEND_Initialize: fastdeploy
I1201 03:41:00.455951 9800 fastdeploy_runtime.cc:1175] Triton TRITONBACKEND API version: 1.6
I1201 03:41:00.455960 9800 fastdeploy_runtime.cc:1180] 'fastdeploy' TRITONBACKEND API version: 1.6
I1201 03:41:00.455967 9800 fastdeploy_runtime.cc:1209] backend configuration:
{}
I1201 03:41:00.455999 9800 python.cc:1875] TRITONBACKEND_ModelInstanceInitialize: preprocess_0 (CPU device 0)
I1201 03:41:01.095376 9800 fastdeploy_runtime.cc:1239] TRITONBACKEND_ModelInitialize: runtime (version 1)
I1201 03:41:01.095540 9800 model_repository_manager.cc:1183] successfully loaded 'preprocess' version 1
I1201 03:41:01.097731 9800 fastdeploy_runtime.cc:1278] TRITONBACKEND_ModelInstanceInitialize: runtime_0 (GPU device 0)
[INFO] fastdeploy/runtime.cc(496)::Init	Runtime initialized with Backend::ORT in Device::GPU.
I1201 03:41:04.015391 9800 model_repository_manager.cc:1183] successfully loaded 'runtime' version 1
I1201 03:41:04.015668 9800 model_repository_manager.cc:1022] loading: yolov5:1
I1201 03:41:04.118517 9800 model_repository_manager.cc:1183] successfully loaded 'yolov5' version 1
I1201 03:41:04.118649 9800 server.cc:522] 
+------------------+------+
| Repository Agent | Path |
+------------------+------+
+------------------+------+

I1201 03:41:04.118708 9800 server.cc:549] 
+------------+---------------------------------------------------------------+--------------------------------------------------+
| Backend    | Path                                                          | Config                                           |
+------------+---------------------------------------------------------------+--------------------------------------------------+
| python     | /opt/tritonserver/backends/python/libtriton_python.so         | {"cmdline":{"shm-default-byte-size":"10485760"}} |
| fastdeploy | /opt/tritonserver/backends/fastdeploy/libtriton_fastdeploy.so | {}                                               |
+------------+---------------------------------------------------------------+--------------------------------------------------+

I1201 03:41:04.118766 9800 server.cc:592] 
+-------------+---------+--------+
| Model       | Version | Status |
+-------------+---------+--------+
| postprocess | 1       | READY  |
| preprocess  | 1       | READY  |
| runtime     | 1       | READY  |
| yolov5      | 1       | READY  |
+-------------+---------+--------+

I1201 03:41:04.118918 9800 tritonserver.cc:1920] 
+----------------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Option                           | Value                                                                                                                                                                                  |
+----------------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| server_id                        | triton                                                                                                                                                                                 |
| server_version                   | 2.15.0                                                                                                                                                                                 |
| server_extensions                | classification sequence model_repository model_repository(unload_dependents) schedule_policy model_configuration system_shared_memory cuda_shared_memory binary_tensor_data statistics |
| model_repository_path[0]         | models/                                                                                                                                                                                |
| model_control_mode               | MODE_NONE                                                                                                                                                                              |
| strict_model_config              | 1                                                                                                                                                                                      |
| rate_limit                       | OFF                                                                                                                                                                                    |
| pinned_memory_pool_byte_size     | 268435456                                                                                                                                                                              |
| cuda_memory_pool_byte_size{0}    | 67108864                                                                                                                                                                               |
| cuda_memory_pool_byte_size{1}    | 67108864                                                                                                                                                                               |
| cuda_memory_pool_byte_size{2}    | 67108864                                                                                                                                                                               |
| cuda_memory_pool_byte_size{3}    | 67108864                                                                                                                                                                               |
| cuda_memory_pool_byte_size{4}    | 67108864                                                                                                                                                                               |
| cuda_memory_pool_byte_size{5}    | 67108864                                                                                                                                                                               |
| cuda_memory_pool_byte_size{6}    | 67108864                                                                                                                                                                               |
| response_cache_byte_size         | 0                                                                                                                                                                                      |
| min_supported_compute_capability | 6.0                                                                                                                                                                                    |
| strict_readiness                 | 1                                                                                                                                                                                      |
| exit_timeout                     | 30                                                                                                                                                                                     |
+----------------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+

I1201 03:41:04.120176 9800 grpc_server.cc:4117] Started GRPCInferenceService at 0.0.0.0:8001
I1201 03:41:04.120557 9800 http_server.cc:2815] Started HTTPService at 0.0.0.0:8000
I1201 03:41:04.161549 9800 http_server.cc:167] Started Metrics Service at 0.0.0.0:8002
Signal (2) received.
I1201 03:41:24.491580 9800 server.cc:252] Waiting for in-flight requests to complete.
I1201 03:41:24.491604 9800 model_repository_manager.cc:1055] unloading: yolov5:1
I1201 03:41:24.491679 9800 model_repository_manager.cc:1055] unloading: runtime:1
I1201 03:41:24.491727 9800 model_repository_manager.cc:1055] unloading: preprocess:1
I1201 03:41:24.491772 9800 model_repository_manager.cc:1055] unloading: postprocess:1
I1201 03:41:24.491822 9800 server.cc:267] Timeout 30: Found 4 live models and 0 in-flight non-inference requests
I1201 03:41:24.492059 9800 fastdeploy_runtime.cc:1310] TRITONBACKEND_ModelInstanceFinalize: delete instance state
I1201 03:41:24.492085 9800 model_repository_manager.cc:1166] successfully unloaded 'yolov5' version 1
I1201 03:41:24.501626 9800 fastdeploy_runtime.cc:1259] TRITONBACKEND_ModelFinalize: delete model state
I1201 03:41:24.502970 9800 model_repository_manager.cc:1166] successfully unloaded 'runtime' version 1
Signal (2) received.
Signal (2) received.
Signal (2) received.
Signal (2) received.
Signal (2) received.
Signal (2) received.
I1201 03:41:25.492385 9800 server.cc:267] Timeout 29: Found 2 live models and 0 in-flight non-inference requests
model_config: {'name': 'preprocess', 'platform': '', 'backend': 'python', 'version_policy': {'latest': {'num_versions': 1}}, 'max_batch_size': 1, 'input': [{'name': 'INPUT_0', 'data_type': 'TYPE_UINT8', 'format': 'FORMAT_NONE', 'dims': [-1, -1, 3], 'is_shape_tensor': False, 'allow_ragged_batch': False}], 'output': [{'name': 'preprocess_output_0', 'data_type': 'TYPE_FP32', 'dims': [3, -1, -1], 'label_filename': '', 'is_shape_tensor': False}, {'name': 'preprocess_output_1', 'data_type': 'TYPE_STRING', 'dims': [-1], 'label_filename': '', 'is_shape_tensor': False}], 'batch_input': [], 'batch_output': [], 'optimization': {'priority': 'PRIORITY_DEFAULT', 'input_pinned_memory': {'enable': True}, 'output_pinned_memory': {'enable': True}, 'gather_kernel_buffer_threshold': 0, 'eager_batching': False}, 'instance_group': [{'name': 'preprocess_0', 'kind': 'KIND_CPU', 'count': 1, 'gpus': [], 'secondary_devices': [], 'profile': [], 'passive': False, 'host_policy': ''}], 'default_model_filename': '', 'cc_model_filenames': {}, 'metric_tags': {}, 'parameters': {}, 'model_warmup': []}
preprocess input names: ['INPUT_0']
preprocess output names: ['preprocess_output_0', 'preprocess_output_1']
Cleaning up...
model_config: {'name': 'postprocess', 'platform': '', 'backend': 'python', 'version_policy': {'latest': {'num_versions': 1}}, 'max_batch_size': 0, 'input': [{'name': 'POST_INPUT_0', 'data_type': 'TYPE_FP32', 'format': 'FORMAT_NONE', 'dims': [-1, -1, -1], 'is_shape_tensor': False, 'allow_ragged_batch': False}, {'name': 'POST_INPUT_1', 'data_type': 'TYPE_STRING', 'format': 'FORMAT_NONE', 'dims': [-1], 'is_shape_tensor': False, 'allow_ragged_batch': False}], 'output': [{'name': 'POST_OUTPUT', 'data_type': 'TYPE_STRING', 'dims': [-1], 'label_filename': '', 'is_shape_tensor': False}], 'batch_input': [], 'batch_output': [], 'optimization': {'priority': 'PRIORITY_DEFAULT', 'input_pinned_memory': {'enable': True}, 'output_pinned_memory': {'enable': True}, 'gather_kernel_buffer_threshold': 0, 'eager_batching': False}, 'instance_group': [{'name': 'postprocess_0', 'kind': 'KIND_CPU', 'count': 1, 'gpus': [], 'secondary_devices': [], 'profile': [], 'passive': False, 'host_policy': ''}], 'default_model_filename': '', 'cc_model_filenames': {}, 'metric_tags': {}, 'parameters': {}, 'model_warmup': []}
postprocess input names: ['POST_INPUT_0', 'POST_INPUT_1']
postprocess output names: ['POST_OUTPUT']
Cleaning up...
I1201 03:41:25.564997 9800 model_repository_manager.cc:1166] successfully unloaded 'preprocess' version 1
I1201 03:41:25.566774 9800 model_repository_manager.cc:1166] successfully unloaded 'postprocess' version 1
I1201 03:41:26.492445 9800 server.cc:267] Timeout 28: Found 0 live models and 0 in-flight non-inference requests
Signal (2) received.
Signal (2) received.
Signal (2) received.
Signal (2) received.
`;
