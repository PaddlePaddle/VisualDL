import json

import requests
import tritonclient.http as httpclient
from attrdict import AttrDict
from tritonclient.utils import InferenceServerException


def convert_http_metadata_config(metadata):
    metadata = AttrDict(metadata)

    return metadata


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
        infer_input = httpclient.InferInput(
            input_name, inputs_data[input_name].shape, input_dict['datatype'])
        infer_input.set_data_from_numpy(inputs_data[input_name])
        inputs.append(infer_input)
    outputs = []
    for output_dict in outputs_meta:
        infer_output = httpclient.InferRequestedOutput(output_dict.name)
        outputs.append(infer_output)
    return inputs, outputs


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
                'Can not connect to server {}, please check your \
        server address'.format(server_url))

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
            result = response.as_numpy(output.name)  # datatype: numpy
            if output.datatype == 'BYTES':
                result = result[0][0]  # datatype: bytes
                result = json.loads(result)  # datatype: json
            else:
                result = result[0]
            results[output.name] = result
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
        except InferenceServerException as e:
            raise RuntimeError("Failed to retrieve the metadata: " + str(e))

        model_metadata = convert_http_metadata_config(model_metadata)

        input_metadata = model_metadata.inputs
        output_metadata = model_metadata.outputs
        return input_metadata, output_metadata
