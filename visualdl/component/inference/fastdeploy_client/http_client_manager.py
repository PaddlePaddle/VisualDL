# Copyright (c) 2022 VisualDL Authors. All Rights Reserve.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# =======================================================================
import json
import re

import numpy as np
import requests
import tritonclient.http as httpclient


def prepare_request(inputs_meta, inputs_data, outputs_meta):
    '''
    inputs_meta: inputs meta information from model. name: info
    inputs_data: users input data. name: data
    '''
    # Set the input data
    inputs = []
    for input_dict in inputs_meta:
        input_name = input_dict['name']
        if input_name not in inputs_data:
            raise RuntimeError(
                'Error: input name {} required for model not existed.'.format(
                    input_name))
        if input_dict['datatype'] == 'FP32':
            inputs_data[input_name] = inputs_data[input_name].astype(
                np.float32
            ) / 255  # image data returned by gradio is uint8, convert to fp32
        if len(input_dict['shape']
               ) == 3 and input_dict['shape'][0] == 3:  # NCHW
            inputs_data[input_name] = inputs_data[input_name][0].transpose(
                2, 0, 1)
        elif len(input_dict['shape']
                 ) == 4 and input_dict['shape'][1] == 3:  # NCHW
            inputs_data[input_name] = inputs_data[input_name].transpose(
                0, 3, 1, 2)
        infer_input = httpclient.InferInput(
            input_name, inputs_data[input_name].shape, input_dict['datatype'])
        infer_input.set_data_from_numpy(inputs_data[input_name])
        inputs.append(infer_input)
    outputs = []
    for output_dict in outputs_meta:
        infer_output = httpclient.InferRequestedOutput(output_dict['name'])
        outputs.append(infer_output)
    return inputs, outputs


metrics_table_head = """
<style>
table, th {{
  border:0.1px solid black;
}}
</style>

<div>
<table style="width:100%">
  <tr>
    <th rowspan="2">模型名称</th>
    <th colspan="4">执行统计</th>
    <th colspan="5">延迟统计</th>

  </tr>
  <tr>
   <th>请求处理成功数</th>
  <th>请求处理失败数</th>
  <th>推理batch数</th>
  <th>推理样本数</th>
  <th>请求处理时间(ms)</th>
  <th>任务队列等待时间(ms)</th>
  <th>输入处理时间(ms)</th>
  <th>模型推理时间(ms)</th>
  <th>输出处理时间(ms)</th>
  </tr>
  {}
</table>
</div>
<br>
<br>
<br>
<br>
<br>
<div>
<table style="width:100%">
  <tr>
    <th rowspan="2">GPU</th>
    <th colspan="4">性能指标</th>
    <th colspan="2">显存</th>
  </tr>
  <tr>
   <th>利用率(%)</th>
  <th>功率(W)</th>
  <th>功率限制(W)</th>
  <th>耗电量(W)</th>
  <th>总量(GB)</th>
  <th>已使用(GB)</th>
  </tr>
  {}
</table>
</div>
"""

metrics_table_head_en = """
<style>
table, th {{
  border:0.1px solid black;
}}
</style>

<div>
<table style="width:100%">
  <tr>
    <th rowspan="2">Model name</th>
    <th colspan="4">Execution metric</th>
    <th colspan="5">Delay metric</th>

  </tr>
  <tr>
   <th>inference request success</th>
  <th>inference request failure</th>
  <th>inference count</th>
  <th>inference exec count</th>
  <th>inference request duration(ms)</th>
  <th>inference queue duration(ms)</th>
  <th>inference comput input duration(ms)</th>
  <th>inference compute infer duration
(ms)</th>
  <th>inference compute output duration(ms)</th>
  </tr>
  {}
</table>
</div>
<br>
<br>
<br>
<br>
<br>
<div>
<table style="width:100%">
  <tr>
    <th rowspan="2">GPU</th>
    <th colspan="4">Performance metric</th>
    <th colspan="2">Memory</th>
  </tr>
  <tr>
   <th>utilization(%)</th>
  <th>power usage(W)</th>
  <th>power limit(W)</th>
  <th>energy consumption(W)</th>
  <th>total(GB)</th>
  <th>used(GB)</th>
  </tr>
  {}
</table>
</div>
"""


def get_metric_data(server_addr, metric_port, lang='zh'):  # noqa:C901
    '''
    Get metrics data from fastdeploy server, and transform it into html table.
    Args:
        server_addr(str): fastdeployserver ip address
        metric_port(int): fastdeployserver metrics port
    Returns:
        htmltable(str): html table to show metrics data
    '''
    model_table = {}
    gpu_table = {}
    metric_column_name = {
        "Model": {
            "nv_inference_request_success", "nv_inference_request_failure",
            "nv_inference_count", "nv_inference_exec_count",
            "nv_inference_request_duration_us",
            "nv_inference_queue_duration_us",
            "nv_inference_compute_input_duration_us",
            "nv_inference_compute_infer_duration_us",
            "nv_inference_compute_output_duration_us"
        },
        "GPU": {
            "nv_gpu_power_usage", "nv_gpu_power_limit",
            "nv_energy_consumption", "nv_gpu_utilization",
            "nv_gpu_memory_total_bytes", "nv_gpu_memory_used_bytes"
        },
        "CPU": {
            "nv_cpu_utilization", "nv_cpu_memory_total_bytes",
            "nv_cpu_memory_used_bytes"
        }
    }
    try:
        res = requests.get("http://{}:{}/metrics".format(
            server_addr, metric_port))
    except Exception:
        return metrics_table_head.format('', '')
    metric_content = res.text
    for content in metric_content.split('\n'):
        if content.startswith('#'):
            continue
        else:
            res = re.match(r'(\w+){(.*)} (\w+)',
                           content)  # match output by server metrics interface
            if not res:
                continue
            metric_name = res.group(1)
            model = res.group(2)
            value = res.group(3)
            infos = {}
            for info in model.split(','):
                k, v = info.split('=')
                v = v.strip('"')
                infos[k] = v
            if metric_name in [
                    "nv_inference_request_duration_us",
                    "nv_inference_queue_duration_us",
                    "nv_inference_compute_input_duration_us",
                    "nv_inference_compute_infer_duration_us",
                    "nv_inference_compute_output_duration_us"
            ]:
                value = str(float(value) / 1000)
            elif metric_name in [
                    "nv_gpu_memory_total_bytes", "nv_gpu_memory_used_bytes"
            ]:
                value = str(float(value) / 1024 / 1024 / 1024)
            for key, metric_names in metric_column_name.items():
                if metric_name in metric_names:
                    if key == 'Model':
                        model_name = infos['model']
                        if model_name not in model_table:
                            model_table[model_name] = {}
                        model_table[model_name][metric_name] = value
                    elif key == 'GPU':
                        gpu_name = infos['gpu_uuid']
                        if gpu_name not in gpu_table:
                            gpu_table[gpu_name] = {}
                        gpu_table[gpu_name][metric_name] = value
                    elif key == 'CPU':
                        pass
    model_data_list = []
    gpu_data_list = []
    model_data_metric_names = [
        "nv_inference_request_success", "nv_inference_request_failure",
        "nv_inference_exec_count", "nv_inference_count",
        "nv_inference_request_duration_us", "nv_inference_queue_duration_us",
        "nv_inference_compute_input_duration_us",
        "nv_inference_compute_infer_duration_us",
        "nv_inference_compute_output_duration_us"
    ]
    gpu_data_metric_names = [
        "nv_gpu_utilization", "nv_gpu_power_usage", "nv_gpu_power_limit",
        "nv_energy_consumption", "nv_gpu_memory_total_bytes",
        "nv_gpu_memory_used_bytes"
    ]
    for k, v in model_table.items():
        data = []
        data.append(k)
        for data_metric in model_data_metric_names:
            data.append(v[data_metric])
        model_data_list.append(data)
    for k, v in gpu_table.items():
        data = []
        data.append(k)
        for data_metric in gpu_data_metric_names:
            data.append(v[data_metric])
        gpu_data_list.append(data)
    model_data = '\n'.join([
        "<tr>" + '\n'.join(["<td>" + item + "</td>"
                            for item in data]) + "</tr>"
        for data in model_data_list
    ])
    gpu_data = '\n'.join([
        "<tr>" + '\n'.join(["<td>" + item + "</td>"
                            for item in data]) + "</tr>"
        for data in gpu_data_list
    ])
    if lang == 'en':
        return metrics_table_head_en.format(model_data, gpu_data)
    return metrics_table_head.format(model_data, gpu_data)


class HttpClientManager:
    def __init__(self):
        self.clients = {}  # server url: httpclient

    def _create_client(self, server_url):
        if server_url in self.clients:
            return self.clients[server_url]
        try:
            fastdeploy_client = httpclient.InferenceServerClient(server_url)
            self.clients[server_url] = fastdeploy_client
            return fastdeploy_client
        except Exception:
            raise RuntimeError(
                'Can not connect to server {}, please check your '
                'server address'.format(server_url))

    def infer(self, server_url, model_name, model_version, inputs):
        fastdeploy_client = self._create_client(server_url)
        input_metadata, output_metadata = self.get_model_meta(
            server_url, model_name, model_version)
        inputs, outputs = prepare_request(input_metadata, inputs,
                                          output_metadata)
        response = fastdeploy_client.infer(
            model_name, inputs, model_version=model_version, outputs=outputs)

        results = {}
        for output in output_metadata:
            result = response.as_numpy(output['name'])  # datatype: numpy
            if output['datatype'] == 'BYTES':  # datatype: bytes
                try:
                    value = result
                    if len(result.shape) == 1:
                        value = result[0]
                    elif len(result.shape) == 2:
                        value = result[0][0]
                    elif len(result.shape) == 3:
                        value = result[0][0][0]
                    result = json.loads(value)  # datatype: json
                except Exception:
                    pass
            else:
                result = result[0]
            results[output['name']] = result
        return results

    def raw_infer(self, server_url, model_name, model_version, raw_input):
        url = 'http://{}/v2/models/{}/versions/{}/infer'.format(
            server_url, model_name, model_version)
        res = requests.post(url, data=json.dumps(json.loads(raw_input)))
        return json.dumps(res.json())

    def get_model_meta(self, server_url, model_name, model_version):
        fastdeploy_client = self._create_client(server_url)
        try:
            model_metadata = fastdeploy_client.get_model_metadata(
                model_name=model_name, model_version=model_version)
        except Exception as e:
            raise RuntimeError("Failed to retrieve the metadata: " + str(e))

        input_metadata = model_metadata['inputs']
        output_metadata = model_metadata['outputs']
        return input_metadata, output_metadata
