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
    Model: {
        yolov5: {
            nv_inference_request_success: '0',
            nv_inference_request_failure: '0',
            nv_inference_count: '0',
            nv_inference_exec_count: '0',
            nv_inference_request_duration_us: '0',
            nv_inference_queue_duration_us: '0',
            nv_inference_compute_input_duration_us: '0',
            nv_inference_compute_infer_duration_us: '0',
            nv_inference_compute_output_duration_us: '0'
        },
        runtime: {
            nv_inference_request_success: '0',
            nv_inference_request_failure: '0',
            nv_inference_count: '0',
            nv_inference_exec_count: '0',
            nv_inference_request_duration_us: '0',
            nv_inference_queue_duration_us: '0',
            nv_inference_compute_input_duration_us: '0',
            nv_inference_compute_infer_duration_us: '0',
            nv_inference_compute_output_duration_us: '0'
        },
        preprocess: {
            nv_inference_request_success: '0',
            nv_inference_request_failure: '0',
            nv_inference_count: '0',
            nv_inference_exec_count: '0',
            nv_inference_request_duration_us: '0',
            nv_inference_queue_duration_us: '0',
            nv_inference_compute_input_duration_us: '0',
            nv_inference_compute_infer_duration_us: '0',
            nv_inference_compute_output_duration_us: '0'
        },
        postprocess: {
            nv_inference_request_success: '0',
            nv_inference_request_failure: '0',
            nv_inference_count: '0',
            nv_inference_exec_count: '0',
            nv_inference_request_duration_us: '0',
            nv_inference_queue_duration_us: '0',
            nv_inference_compute_input_duration_us: '0',
            nv_inference_compute_infer_duration_us: '0',
            nv_inference_compute_output_duration_us: '0'
        }
    },
    GPU: {
        'GPU-fe9adac3-25d8-0b4f-fffc-9397a7985a28': {
            nv_gpu_utilization: '0',
            nv_gpu_memory_total_bytes: '24159191040',
            nv_gpu_memory_used_bytes: '350224384',
            nv_gpu_power_usage: '50',
            nv_gpu_power_limit: '250',
            nv_energy_consumption: '914'
        },
        'GPU-080f3ff9-2e52-0e73-61ea-5fc301f78321': {
            nv_gpu_utilization: '0',
            nv_gpu_memory_total_bytes: '24159191040',
            nv_gpu_memory_used_bytes: '350224384',
            nv_gpu_power_usage: '51',
            nv_gpu_power_limit: '250',
            nv_energy_consumption: '940'
        },
        'GPU-7350ae76-901d-45f2-77ef-0ca26da53abf': {
            nv_gpu_utilization: '0',
            nv_gpu_memory_total_bytes: '24159191040',
            nv_gpu_memory_used_bytes: '1668284416',
            nv_gpu_power_usage: '52',
            nv_gpu_power_limit: '250',
            nv_energy_consumption: '956'
        },
        'GPU-85ce09c2-23c9-d346-274d-f1eb6de7083f': {
            nv_gpu_utilization: '0',
            nv_gpu_memory_total_bytes: '24159191040',
            nv_gpu_memory_used_bytes: '350224384',
            nv_gpu_power_usage: '51',
            nv_gpu_power_limit: '250',
            nv_energy_consumption: '946'
        },
        'GPU-ac8da5c4-9a6e-eb0b-763f-1c7121b2ab65': {
            nv_gpu_utilization: '0',
            nv_gpu_memory_total_bytes: '24159191040',
            nv_gpu_memory_used_bytes: '350224384',
            nv_gpu_power_usage: '50',
            nv_gpu_power_limit: '250',
            nv_energy_consumption: '918'
        },
        'GPU-032ea902-18dd-454c-8fc9-459d909005a5': {
            nv_gpu_utilization: '0',
            nv_gpu_memory_total_bytes: '24159191040',
            nv_gpu_memory_used_bytes: '350224384',
            nv_gpu_power_usage: '50',
            nv_gpu_power_limit: '250',
            nv_energy_consumption: '924'
        },
        'GPU-87ba4a86-a7c5-b394-d4b0-2b063e95f8c6': {
            nv_gpu_utilization: '0',
            nv_gpu_memory_total_bytes: '24159191040',
            nv_gpu_memory_used_bytes: '11399069696',
            nv_gpu_power_usage: '53',
            nv_gpu_power_limit: '250',
            nv_energy_consumption: '971'
        }
    }
};
