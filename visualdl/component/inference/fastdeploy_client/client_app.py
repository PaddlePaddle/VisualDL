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
import gradio as gr
import numpy as np

from .http_client_manager import get_metric_data
from .http_client_manager import HttpClientManager
from .http_client_manager import metrics_table_head
from .http_client_manager import metrics_table_head_en
from .visualizer import visualize_detection
from .visualizer import visualize_face_alignment
from .visualizer import visualize_face_detection
from .visualizer import visualize_headpose
from .visualizer import visualize_keypoint_detection
from .visualizer import visualize_matting
from .visualizer import visualize_ocr
from .visualizer import visualize_segmentation

_http_manager = HttpClientManager()

supported_tasks = {
    'detection': visualize_detection,
    'facedet': visualize_face_detection,
    'keypointdetection': visualize_keypoint_detection,
    'segmentation': visualize_segmentation,
    'matting': visualize_matting,
    'ocr': visualize_ocr,
    'facealignment': visualize_face_alignment,
    'headpose': visualize_headpose,
    'unspecified': lambda x: str(x)
}


def create_gradio_client_app():  # noqa:C901
    css = """
          .gradio-container {
              font-family: 'IBM Plex Sans', sans-serif;
          }
          .gr-button {
              color: white;
              border-color: black;
              background: black;
          }
          input[type='range'] {
              accent-color: black;
          }
          .dark input[type='range'] {
              accent-color: #dfdfdf;
          }
          #gallery {
              min-height: 22rem;
              margin-bottom: 15px;
              margin-left: auto;
              margin-right: auto;
              border-bottom-right-radius: .5rem !important;
              border-bottom-left-radius: .5rem !important;
          }
          #gallery>div>.h-full {
              min-height: 20rem;
          }
          .details:hover {
              text-decoration: underline;
          }
          .gr-button {
              white-space: nowrap;
          }
          .gr-button:focus {
              border-color: rgb(147 197 253 / var(--tw-border-opacity));
              outline: none;
              box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
              --tw-border-opacity: 1;
              --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) \
                var(--tw-ring-offset-color);
              --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(3px var(--tw-ring-offset-width)) var(--tw-ring-color);
              --tw-ring-color: rgb(191 219 254 / var(--tw-ring-opacity));
              --tw-ring-opacity: .5;
          }
          .footer {
              margin-bottom: 45px;
              margin-top: 35px;
              text-align: center;
              border-bottom: 1px solid #e5e5e5;
          }
          .footer>p {
              font-size: .8rem;
              display: inline-block;
              padding: 0 10px;
              transform: translateY(10px);
              background: white;
          }
          .dark .footer {
              border-color: #303030;
          }
          .dark .footer>p {
              background: #0b0f19;
          }
          .prompt h4{
              margin: 1.25em 0 .25em 0;
              font-weight: bold;
              font-size: 115%;
          }
  """

    block = gr.Blocks(css=css)

    with block:
        gr.HTML("""
              <div style="text-align: center; max-width: 650px; margin: 0 auto;">
                <div
                  style="
                    display: inline-flex;
                    gap: 0.8rem;
                    font-size: 1.75rem;
                    justify-content: center;
                  "
                >
                <h1>
                FastDeploy Client
                </h1>
                </div>
                <p font-size: 94%">
                The client is used for creating requests to fastdeploy server.
                </p>
              </div>
          """)
        with gr.Group():
            with gr.Box():
                with gr.Column():
                    with gr.Row():
                        server_addr_text = gr.Textbox(
                            label="服务ip",
                            show_label=True,
                            max_lines=1,
                            placeholder="localhost",
                        )

                        server_http_port_text = gr.Textbox(
                            label="推理服务端口",
                            show_label=True,
                            max_lines=1,
                            placeholder="8000",
                        )

                        server_metric_port_text = gr.Textbox(
                            label="性能服务端口",
                            show_label=True,
                            max_lines=1,
                            placeholder="8002",
                        )
                    with gr.Row():
                        model_name_text = gr.Textbox(
                            label="模型名称",
                            show_label=True,
                            max_lines=1,
                            placeholder="yolov5",
                        )
                        model_version_text = gr.Textbox(
                            label="模型版本",
                            show_label=True,
                            max_lines=1,
                            placeholder="1",
                        )

            with gr.Box():
                with gr.Tab("组件形式"):
                    check_button = gr.Button("获取模型输入输出")
                    component_format_column = gr.Column(visible=False)
                    with component_format_column:
                        task_radio = gr.Radio(
                            choices=list(supported_tasks.keys()),
                            value='unspecified',
                            label='任务类型',
                            visible=True)
                        gr.Markdown("根据模型需要，挑选文本框或者图像框进行输入")
                        with gr.Row():
                            with gr.Column():
                                gr.Markdown("模型输入")
                                input_accordions = []
                                input_name_texts = []
                                input_images = []
                                input_texts = []
                                for i in range(6):
                                    accordion = gr.Accordion(
                                        "输入变量 {}".format(i),
                                        open=True,
                                        visible=False)
                                    with accordion:
                                        input_name_text = gr.Textbox(
                                            label="变量名", interactive=False)
                                        input_image = gr.Image(type='numpy')
                                        input_text = gr.Textbox(
                                            label="文本框", max_lines=1000)
                                    input_accordions.append(accordion)
                                    input_name_texts.append(input_name_text)
                                    input_images.append(input_image)
                                    input_texts.append(input_text)

                            with gr.Column():
                                gr.Markdown("模型输出")
                                output_accordions = []
                                output_name_texts = []
                                output_images = []
                                output_texts = []
                                for i in range(6):
                                    accordion = gr.Accordion(
                                        "输出变量 {}".format(i),
                                        open=True,
                                        visible=False)
                                    with accordion:
                                        output_name_text = gr.Textbox(
                                            label="变量名", interactive=False)
                                        output_text = gr.Textbox(
                                            label="服务返回的原数据",
                                            interactive=False,
                                            show_label=True)
                                        output_image = gr.Image(
                                            interactive=False)
                                    output_accordions.append(accordion)
                                    output_name_texts.append(output_name_text)
                                    output_images.append(output_image)
                                    output_texts.append(output_text)
                        component_submit_button = gr.Button("提交请求")
                with gr.Tab("原始形式"):
                    gr.Markdown("模型输入")
                    raw_payload_text = gr.Textbox(
                        label="负载数据", max_lines=10000)
                    with gr.Column():
                        gr.Markdown("输出")
                        output_raw_text = gr.Textbox(
                            label="服务返回的原始数据", interactive=False)
                    raw_submit_button = gr.Button("提交请求")

            with gr.Box():
                with gr.Column():
                    gr.Markdown("服务性能统计（每次提交请求会自动更新数据，您也可以手动点击更新）")
                    output_html_table = gr.HTML(
                        label="metrics",
                        interactive=False,
                        show_label=False,
                        value=metrics_table_head.format('', ''))
                    update_metric_button = gr.Button("更新统计数据")

            status_text = gr.Textbox(
                label="status",
                show_label=True,
                max_lines=1,
                interactive=False)

        lang_text = gr.Textbox(
            label="lang",
            show_label=False,
            value='zh',
            max_lines=1,
            visible=False
        )  # This text box is only used for divide zh and en page

        all_input_output_components = input_accordions + input_name_texts + input_images + \
            input_texts + output_accordions + output_name_texts + output_images + output_texts

        def get_input_output_name(server_ip, server_port, model_name,
                                  model_version, lang_text):
            try:
                server_addr = server_ip + ':' + server_port
                input_metas, output_metas = _http_manager.get_model_meta(
                    server_addr, model_name, model_version)
            except Exception as e:
                return {status_text: str(e)}
            results = {
                component: None
                for component in all_input_output_components
            }
            results[component_format_column] = gr.update(visible=True)
            for input_accordio in input_accordions:
                results[input_accordio] = gr.update(visible=False)
            for output_accordio in output_accordions:
                results[output_accordio] = gr.update(visible=False)
            results[status_text] = 'Get model inputs and outputs successfully.'
            for i, input_meta in enumerate(input_metas):
                results[input_accordions[i]] = gr.update(visible=True)
                results[input_name_texts[i]] = input_meta['name']
            for i, output_meta in enumerate(output_metas):
                results[output_accordions[i]] = gr.update(visible=True)
                results[output_name_texts[i]] = output_meta['name']
            return results

        def component_inference(*args):
            server_ip = args[0]
            http_port = args[1]
            metric_port = args[2]
            model_name = args[3]
            model_version = args[4]
            names = args[5:5 + len(input_name_texts)]
            images = args[5 + len(input_name_texts):5 + len(input_name_texts) +
                          len(input_images)]
            texts = args[5 + len(input_name_texts) + len(input_images):5 +
                         len(input_name_texts) + len(input_images) +
                         len(input_texts)]
            task_type = args[-1]
            server_addr = server_ip + ':' + http_port
            if server_ip and http_port and model_name and model_version:
                inputs = {}
                for i, input_name in enumerate(names):
                    if input_name:
                        if images[i] is not None:
                            inputs[input_name] = np.array([images[i]])
                        if texts[i]:
                            inputs[input_name] = np.array(
                                [[texts[i].encode('utf-8')]], dtype=np.object_)
                try:
                    infer_results = _http_manager.infer(
                        server_addr, model_name, model_version, inputs)
                    results = {status_text: 'Inference successfully.'}
                    for i, (output_name,
                            data) in enumerate(infer_results.items()):
                        results[output_name_texts[i]] = output_name
                        results[output_texts[i]] = str(data)
                        if task_type != 'unspecified':
                            try:
                                results[output_images[i]] = supported_tasks[
                                    task_type](images[0], data)
                            except Exception:
                                results[output_images[i]] = None
                    if metric_port:
                        html_table = get_metric_data(server_ip, metric_port,
                                                     'zh')
                        results[output_html_table] = html_table
                    return results
                except Exception as e:
                    return {status_text: 'Error: {}'.format(e)}
            else:
                return {
                    status_text:
                    'Please input server addr, model name and model version.'
                }

        def raw_inference(*args):
            server_ip = args[0]
            http_port = args[1]
            metric_port = args[2]
            model_name = args[3]
            model_version = args[4]
            payload_text = args[5]
            server_addr = server_ip + ':' + http_port
            try:
                result = _http_manager.raw_infer(server_addr, model_name,
                                                 model_version, payload_text)
                results = {
                    status_text: 'Get response from server',
                    output_raw_text: result
                }
                if server_ip and metric_port:
                    html_table = get_metric_data(server_ip, metric_port, 'zh')
                    results[output_html_table] = html_table
                return results
            except Exception as e:
                return {status_text: 'Error: {}'.format(e)}

        def update_metric(server_ip, metrics_port, lang_text):
            if server_ip and metrics_port:
                try:
                    html_table = get_metric_data(server_ip, metrics_port, 'zh')
                    return {
                        output_html_table: html_table,
                        status_text: "Update metrics successfully."
                    }
                except Exception as e:
                    return {status_text: 'Error: {}'.format(e)}
            else:
                return {
                    status_text: 'Please input server ip and metrics_port.'
                }

        check_button.click(
            fn=get_input_output_name,
            inputs=[
                server_addr_text, server_http_port_text, model_name_text,
                model_version_text, lang_text
            ],
            outputs=[
                *all_input_output_components, check_button,
                component_format_column, status_text
            ])
        component_submit_button.click(
            fn=component_inference,
            inputs=[
                server_addr_text, server_http_port_text,
                server_metric_port_text, model_name_text, model_version_text,
                *input_name_texts, *input_images, *input_texts, task_radio
            ],
            outputs=[
                *output_name_texts, *output_images, *output_texts, status_text,
                output_html_table
            ])
        raw_submit_button.click(
            fn=raw_inference,
            inputs=[
                server_addr_text, server_http_port_text,
                server_metric_port_text, model_name_text, model_version_text,
                raw_payload_text
            ],
            outputs=[output_raw_text, status_text, output_html_table])
        update_metric_button.click(
            fn=update_metric,
            inputs=[server_addr_text, server_metric_port_text, lang_text],
            outputs=[output_html_table, status_text])
    return block


def create_gradio_client_app_en():  # noqa:C901
    css = """
          .gradio-container {
              font-family: 'IBM Plex Sans', sans-serif;
          }
          .gr-button {
              color: white;
              border-color: black;
              background: black;
          }
          input[type='range'] {
              accent-color: black;
          }
          .dark input[type='range'] {
              accent-color: #dfdfdf;
          }
          #gallery {
              min-height: 22rem;
              margin-bottom: 15px;
              margin-left: auto;
              margin-right: auto;
              border-bottom-right-radius: .5rem !important;
              border-bottom-left-radius: .5rem !important;
          }
          #gallery>div>.h-full {
              min-height: 20rem;
          }
          .details:hover {
              text-decoration: underline;
          }
          .gr-button {
              white-space: nowrap;
          }
          .gr-button:focus {
              border-color: rgb(147 197 253 / var(--tw-border-opacity));
              outline: none;
              box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
              --tw-border-opacity: 1;
              --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) \
                var(--tw-ring-offset-color);
              --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(3px var(--tw-ring-offset-width)) var(--tw-ring-color);
              --tw-ring-color: rgb(191 219 254 / var(--tw-ring-opacity));
              --tw-ring-opacity: .5;
          }
          .footer {
              margin-bottom: 45px;
              margin-top: 35px;
              text-align: center;
              border-bottom: 1px solid #e5e5e5;
          }
          .footer>p {
              font-size: .8rem;
              display: inline-block;
              padding: 0 10px;
              transform: translateY(10px);
              background: white;
          }
          .dark .footer {
              border-color: #303030;
          }
          .dark .footer>p {
              background: #0b0f19;
          }
          .prompt h4{
              margin: 1.25em 0 .25em 0;
              font-weight: bold;
              font-size: 115%;
          }
  """

    block = gr.Blocks(css=css)

    with block:
        gr.HTML("""
              <div style="text-align: center; max-width: 650px; margin: 0 auto;">
                <div
                  style="
                    display: inline-flex;
                    gap: 0.8rem;
                    font-size: 1.75rem;
                    justify-content: center;
                  "
                >
                <h1>
                FastDeploy Client
                </h1>
                </div>
                <p font-size: 94%">
                The client is used for creating requests to fastdeploy server.
                </p>
              </div>
          """)
        with gr.Group():
            with gr.Box():
                with gr.Column():
                    with gr.Row():
                        server_addr_text = gr.Textbox(
                            label="server ip",
                            show_label=True,
                            max_lines=1,
                            placeholder="localhost",
                        )

                        server_http_port_text = gr.Textbox(
                            label="server port",
                            show_label=True,
                            max_lines=1,
                            placeholder="8000",
                        )

                        server_metric_port_text = gr.Textbox(
                            label="metrics port",
                            show_label=True,
                            max_lines=1,
                            placeholder="8002",
                        )
                    with gr.Row():
                        model_name_text = gr.Textbox(
                            label="model name",
                            show_label=True,
                            max_lines=1,
                            placeholder="yolov5",
                        )
                        model_version_text = gr.Textbox(
                            label="model version",
                            show_label=True,
                            max_lines=1,
                            placeholder="1",
                        )

            with gr.Box():
                with gr.Tab("Component form"):
                    check_button = gr.Button("get model input and output")
                    component_format_column = gr.Column(visible=False)
                    with component_format_column:
                        task_radio = gr.Radio(
                            choices=list(supported_tasks.keys()),
                            value='unspecified',
                            label='task type',
                            visible=True)
                        gr.Markdown(
                            "Choose text or image component to input according to data type"
                        )
                        with gr.Row():
                            with gr.Column():
                                gr.Markdown("Inputs")
                                input_accordions = []
                                input_name_texts = []
                                input_images = []
                                input_texts = []
                                for i in range(6):
                                    accordion = gr.Accordion(
                                        "variable {}".format(i),
                                        open=True,
                                        visible=False)
                                    with accordion:
                                        input_name_text = gr.Textbox(
                                            label="variable name",
                                            interactive=False)
                                        input_image = gr.Image(type='numpy')
                                        input_text = gr.Textbox(
                                            label="text", max_lines=1000)
                                    input_accordions.append(accordion)
                                    input_name_texts.append(input_name_text)
                                    input_images.append(input_image)
                                    input_texts.append(input_text)

                            with gr.Column():
                                gr.Markdown("Outputs")
                                output_accordions = []
                                output_name_texts = []
                                output_images = []
                                output_texts = []
                                for i in range(6):
                                    accordion = gr.Accordion(
                                        "variable {}".format(i),
                                        open=True,
                                        visible=False)
                                    with accordion:
                                        output_name_text = gr.Textbox(
                                            label="variable name",
                                            interactive=False)
                                        output_text = gr.Textbox(
                                            label="text",
                                            interactive=False,
                                            show_label=True)
                                        output_image = gr.Image(
                                            interactive=False)
                                    output_accordions.append(accordion)
                                    output_name_texts.append(output_name_text)
                                    output_images.append(output_image)
                                    output_texts.append(output_text)
                        component_submit_button = gr.Button("submit request")
                with gr.Tab("Original form"):
                    gr.Markdown("Request")
                    raw_payload_text = gr.Textbox(
                        label="request payload", max_lines=10000)
                    with gr.Column():
                        gr.Markdown("Response")
                        output_raw_text = gr.Textbox(
                            label="raw response data", interactive=False)
                    raw_submit_button = gr.Button("submit request")

            with gr.Box():
                with gr.Column():
                    gr.Markdown(
                        "Metrics（update automatically when submit request，or click update metrics button manually）"
                    )
                    output_html_table = gr.HTML(
                        label="metrics",
                        interactive=False,
                        show_label=False,
                        value=metrics_table_head_en.format('', ''))
                    update_metric_button = gr.Button("update metrics")

            status_text = gr.Textbox(
                label="status",
                show_label=True,
                max_lines=1,
                interactive=False)

        lang_text = gr.Textbox(
            label="lang",
            show_label=False,
            value='en',
            max_lines=1,
            visible=False
        )  # This text box is only used for divide zh and en page

        all_input_output_components = input_accordions + input_name_texts + input_images + \
            input_texts + output_accordions + output_name_texts + output_images + output_texts

        def get_input_output_name(server_ip, server_port, model_name,
                                  model_version, lang_text):
            try:
                server_addr = server_ip + ':' + server_port
                input_metas, output_metas = _http_manager.get_model_meta(
                    server_addr, model_name, model_version)
            except Exception as e:
                return {status_text: str(e)}
            results = {
                component: None
                for component in all_input_output_components
            }
            results[component_format_column] = gr.update(visible=True)
            for input_accordio in input_accordions:
                results[input_accordio] = gr.update(visible=False)
            for output_accordio in output_accordions:
                results[output_accordio] = gr.update(visible=False)
            results[status_text] = 'Get model inputs and outputs successfully.'
            for i, input_meta in enumerate(input_metas):
                results[input_accordions[i]] = gr.update(visible=True)
                results[input_name_texts[i]] = input_meta['name']
            for i, output_meta in enumerate(output_metas):
                results[output_accordions[i]] = gr.update(visible=True)
                results[output_name_texts[i]] = output_meta['name']
            return results

        def component_inference(*args):
            server_ip = args[0]
            http_port = args[1]
            metric_port = args[2]
            model_name = args[3]
            model_version = args[4]
            names = args[5:5 + len(input_name_texts)]
            images = args[5 + len(input_name_texts):5 + len(input_name_texts) +
                          len(input_images)]
            texts = args[5 + len(input_name_texts) + len(input_images):5 +
                         len(input_name_texts) + len(input_images) +
                         len(input_texts)]
            task_type = args[-1]
            server_addr = server_ip + ':' + http_port
            if server_ip and http_port and model_name and model_version:
                inputs = {}
                for i, input_name in enumerate(names):
                    if input_name:
                        if images[i] is not None:
                            inputs[input_name] = np.array([images[i]])
                        if texts[i]:
                            inputs[input_name] = np.array(
                                [[texts[i].encode('utf-8')]], dtype=np.object_)
                try:
                    infer_results = _http_manager.infer(
                        server_addr, model_name, model_version, inputs)
                    results = {status_text: 'Inference successfully.'}
                    for i, (output_name,
                            data) in enumerate(infer_results.items()):
                        results[output_name_texts[i]] = output_name
                        results[output_texts[i]] = str(data)
                        if task_type != 'unspecified':
                            try:
                                results[output_images[i]] = supported_tasks[
                                    task_type](images[0], data)
                            except Exception:
                                results[output_images[i]] = None
                    if metric_port:
                        html_table = get_metric_data(server_ip, metric_port,
                                                     'en')
                        results[output_html_table] = html_table
                    return results
                except Exception as e:
                    return {status_text: 'Error: {}'.format(e)}
            else:
                return {
                    status_text:
                    'Please input server addr, model name and model version.'
                }

        def raw_inference(*args):
            server_ip = args[0]
            http_port = args[1]
            metric_port = args[2]
            model_name = args[3]
            model_version = args[4]
            payload_text = args[5]
            server_addr = server_ip + ':' + http_port
            try:
                result = _http_manager.raw_infer(server_addr, model_name,
                                                 model_version, payload_text)
                results = {
                    status_text: 'Get response from server',
                    output_raw_text: result
                }
                if server_ip and metric_port:
                    html_table = get_metric_data(server_ip, metric_port, 'en')
                    results[output_html_table] = html_table
                return results
            except Exception as e:
                return {status_text: 'Error: {}'.format(e)}

        def update_metric(server_ip, metrics_port, lang_text):
            if server_ip and metrics_port:
                try:
                    html_table = get_metric_data(server_ip, metrics_port, 'en')
                    return {
                        output_html_table: html_table,
                        status_text: "Update metrics successfully."
                    }
                except Exception as e:
                    return {status_text: 'Error: {}'.format(e)}
            else:
                return {
                    status_text: 'Please input server ip and metrics_port.'
                }

        check_button.click(
            fn=get_input_output_name,
            inputs=[
                server_addr_text, server_http_port_text, model_name_text,
                model_version_text, lang_text
            ],
            outputs=[
                *all_input_output_components, check_button,
                component_format_column, status_text
            ])
        component_submit_button.click(
            fn=component_inference,
            inputs=[
                server_addr_text, server_http_port_text,
                server_metric_port_text, model_name_text, model_version_text,
                *input_name_texts, *input_images, *input_texts, task_radio
            ],
            outputs=[
                *output_name_texts, *output_images, *output_texts, status_text,
                output_html_table
            ])
        raw_submit_button.click(
            fn=raw_inference,
            inputs=[
                server_addr_text, server_http_port_text,
                server_metric_port_text, model_name_text, model_version_text,
                raw_payload_text
            ],
            outputs=[output_raw_text, status_text, output_html_table])
        update_metric_button.click(
            fn=update_metric,
            inputs=[server_addr_text, server_metric_port_text, lang_text],
            outputs=[output_html_table, status_text])
    return block
