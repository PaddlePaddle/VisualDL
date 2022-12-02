import gradio as gr
import numpy as np

from .http_client_manager import HttpClientManager
from .visualizer import visualize_detection
from .visualizer import visualize_face_detection
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
    'others(raw data)': lambda x: str(x)
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
          .container {
              max-width: 1200px;
              margin: auto;
              padding-top: 1.5rem;
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
                            label="Server address",
                            show_label=True,
                            max_lines=1,
                            placeholder="localhost:8000",
                        )

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

                    check_button = gr.Button("GetInputOutputName")

            with gr.Box():
                gr.Markdown("Inputs")
                with gr.Tab("component format"):
                    gr.Markdown(
                        "Fill inputs according to your need, choose either image or text for each input."
                    )
                    with gr.Column():
                        with gr.Accordion("input 1"):
                            input_name_1_text = gr.Textbox(
                                label="input name", interactive=False)
                            input_1_image = gr.Image(type='numpy')
                            input_1_text = gr.Textbox(
                                label="contents", max_lines=1000)
                        with gr.Accordion("input 2", open=False):
                            input_name_2_text = gr.Textbox(
                                label="input name", interactive=False)
                            input_2_image = gr.Image(type='numpy')
                            input_2_text = gr.Textbox(
                                label="contents", max_lines=1000)

                        with gr.Accordion("input 3", open=False):
                            input_name_3_text = gr.Textbox(
                                label="input name", interactive=False)
                            input_3_image = gr.Image(type='numpy')
                            input_3_text = gr.Textbox(
                                label="contents", max_lines=1000)
                    with gr.Box():
                        gr.Markdown("Outputs")
                        with gr.Column():
                            with gr.Accordion("output 1"):
                                output_name_1_text = gr.Textbox(
                                    label="output name", interactive=False)
                                task_select_items1 = gr.Dropdown(
                                    choices=list(supported_tasks.keys()),
                                    value='others(raw data)',
                                    label='task type')
                                output_1_text = gr.Textbox(
                                    label="raw data",
                                    interactive=False,
                                    show_label=True)
                                output_1_image = gr.Image(interactive=False)
                            with gr.Accordion("output 2", open=False):
                                output_name_2_text = gr.Textbox(
                                    label="output name", interactive=False)
                                task_select_items2 = gr.Dropdown(
                                    choices=list(supported_tasks.keys()),
                                    value='others(raw data)',
                                    label='task type')
                                output_2_text = gr.Textbox(
                                    label="raw data",
                                    interactive=False,
                                    show_label=True,
                                )
                                output_2_image = gr.Image(interactive=False)

                            with gr.Accordion("output 3", open=False):
                                output_name_3_text = gr.Textbox(
                                    label="output name", interactive=False)
                                task_select_items3 = gr.Dropdown(
                                    choices=list(supported_tasks.keys()),
                                    value='others(raw data)',
                                    label='task type')
                                output_3_text = gr.Textbox(
                                    label="raw data",
                                    interactive=False,
                                    show_label=True)
                                output_3_image = gr.Image(interactive=False)
                    component_submit_button = gr.Button("submit")
                with gr.Tab("raw format"):
                    raw_payload_text = gr.Textbox(
                        label="request payload", max_lines=10000)
                    with gr.Box():
                        gr.Markdown("Outputs")
                        with gr.Column():
                            output_raw_text = gr.Textbox(
                                label="raw data", interactive=False)
                    raw_submit_button = gr.Button("submit")

            status_text = gr.Textbox(
                label="status",
                show_label=True,
                max_lines=1,
                interactive=False)
        all_input_output_components = [
            input_name_1_text, input_name_2_text, input_name_3_text,
            input_1_image, input_2_image, input_3_image, input_1_text,
            input_2_text, input_3_text, output_name_1_text, output_name_2_text,
            output_name_3_text, output_1_text, output_2_text, output_3_text,
            output_1_image, output_2_image, output_3_image, task_select_items1,
            task_select_items2, task_select_items3
        ]

        def get_input_output_name(server_addr, model_name, model_version):
            try:
                input_metas, output_metas = _http_manager.get_model_meta(
                    server_addr, model_name, model_version)
            except Exception as e:
                return {status_text: str(e)}
            input_name_texts = [
                input_name_1_text, input_name_2_text, input_name_3_text
            ]
            output_name_texts = [
                output_name_1_text, output_name_2_text, output_name_3_text
            ]
            results = {
                component: None
                for component in all_input_output_components
            }
            results[task_select_items1] = 'others(raw data)'
            results[task_select_items2] = 'others(raw data)'
            results[task_select_items3] = 'others(raw data)'
            results[status_text] = 'GetInputOutputName Successful'
            for i, input_meta in enumerate(input_metas):
                results[input_name_texts[i]] = input_meta['name']
            for i, output_meta in enumerate(output_metas):
                results[output_name_texts[i]] = output_meta['name']
            return results

        def component_inference(*args):
            server_addr = args[0]
            model_name = args[1]
            model_version = args[2]
            input_name_1 = args[3]
            input_1_image_data = args[4]
            input_1_text_data = args[5]
            input_name_2 = args[6]
            input_2_image_data = args[7]
            input_2_text_data = args[8]
            input_name_3 = args[9]
            input_3_image_data = args[10]
            input_3_text_data = args[11]
            task_select_items1_data = args[12]
            task_select_items2_data = args[13]
            task_select_items3_data = args[14]
            if server_addr and model_name and model_version:
                inputs = {}
                if input_name_1:
                    if input_1_image_data is not None:
                        inputs[input_name_1] = np.array([input_1_image_data])
                    if input_1_text_data:
                        inputs[input_name_1] = np.array(
                            [[input_1_text_data.encode('utf-8')]],
                            dtype=np.object_)
                if input_name_2:
                    if input_2_image_data is not None:
                        inputs[input_name_2] = np.array([input_2_image_data])
                    if input_2_text_data:
                        inputs[input_name_2] = np.array(
                            [[input_2_text_data.encode('utf-8')]],
                            dtype=np.object_)
                if input_name_3:
                    if input_3_image_data is not None:
                        inputs[input_name_3] = np.array([input_3_image_data])
                    if input_3_text_data:
                        inputs[input_name_3] = np.array(
                            [[input_3_text_data.encode('utf-8')]],
                            dtype=np.object_)
                try:
                    infer_results = _http_manager.infer(
                        server_addr, model_name, model_version, inputs)
                    results = {status_text: 'Inference Successful'}
                    output_name_texts = [
                        output_name_1_text, output_name_2_text,
                        output_name_3_text
                    ]
                    output_texts = [
                        output_1_text, output_2_text, output_3_text
                    ]
                    output_images = [
                        output_1_image, output_2_image, output_3_image
                    ]
                    output_task_types = [
                        task_select_items1_data, task_select_items2_data,
                        task_select_items3_data
                    ]
                    for i, (output_name,
                            data) in enumerate(infer_results.items()):
                        results[output_name_texts[i]] = output_name
                        results[output_texts[i]] = str(data)
                        if output_task_types[i] != 'others(raw data)':
                            results[output_images[i]] = supported_tasks[
                                output_task_types[i]](input_1_image_data, data)
                    return results
                except Exception as e:
                    return {status_text: 'Error: {}'.format(e)}
            else:
                return {
                    status_text:
                    'Please input server addr, model name and model version.'
                }

        def raw_inference(*args):
            server_addr = args[0]
            model_name = args[1]
            model_version = args[2]
            payload_text = args[3]
            try:
                result = _http_manager.raw_infer(server_addr, model_name,
                                                 model_version, payload_text)
                results = {
                    status_text: 'Get response from server',
                    output_raw_text: result
                }
                return results
            except Exception as e:
                return {status_text: 'Error: {}'.format(e)}

        check_button.click(
            fn=get_input_output_name,
            inputs=[server_addr_text, model_name_text, model_version_text],
            outputs=[*all_input_output_components, status_text])
        component_submit_button.click(
            fn=component_inference,
            inputs=[
                server_addr_text, model_name_text, model_version_text,
                input_name_1_text, input_1_image, input_1_text,
                input_name_2_text, input_2_image, input_2_text,
                input_name_3_text, input_3_image, input_3_text,
                task_select_items1, task_select_items2, task_select_items3
            ],
            outputs=[
                output_name_1_text, output_name_2_text, output_name_3_text,
                output_1_text, output_2_text, output_3_text, output_1_image,
                output_2_image, output_3_image, status_text
            ])
        raw_submit_button.click(
            fn=raw_inference,
            inputs=[
                server_addr_text, model_name_text, model_version_text,
                raw_payload_text
            ],
            outputs=[output_raw_text, status_text])
    return block
