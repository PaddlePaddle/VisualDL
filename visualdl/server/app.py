#!/user/bin/env python

# Copyright (c) 2017 VisualDL Authors. All Rights Reserve.
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
import os
import time
import sys
import re
from argparse import ArgumentParser

from flask import (Flask, Response, redirect, request, send_file,
                   send_from_directory)

import visualdl
import visualdl.server
import visualdl.server.graph as vdl_graph
import visualdl.server.model as model
from visualdl.server import lib
from visualdl.server.log import logger
from visualdl.server.mock import data as mock_data
from visualdl.server.mock import data as mock_tags
from visualdl.python.cache import MemCache
from visualdl.python.storage import (LogWriter, LogReader)

try:
    import exceptions
except:
    pass

error_retry_times = 3
error_sleep_time = 2  # seconds

SERVER_DIR = os.path.join(visualdl.ROOT, 'server')

support_language = ["en", "zh"]
default_language = support_language[0]

server_path = os.path.abspath(os.path.dirname(sys.argv[0]))
static_file_path = os.path.join(SERVER_DIR, "./dist")
mock_data_path = os.path.join(SERVER_DIR, "./mock_data/")


class ParseArgs(object):
    def __init__(self, logdir, host="0.0.0.0", port=8040, model_pb="", cache_timeout=20, language=default_language):
        self.logdir = logdir
        self.host = host
        self.port = port
        self.model_pb = model_pb
        self.cache_timeout = cache_timeout
        self.language = language


def try_call(function, *args, **kwargs):
    res = lib.retry(error_retry_times, function, error_sleep_time, *args,
                    **kwargs)
    if not res:
        logger.error("server temporary error, will retry latter.")
    return res


def parse_args():
    """
    :return:
    """
    parser = ArgumentParser(
        description="VisualDL, a tool to visualize deep learning.")
    parser.add_argument(
        "-p",
        "--port",
        type=int,
        default=8040,
        action="store",
        dest="port",
        help="api service port")
    parser.add_argument(
        "-t",
        "--host",
        type=str,
        default="0.0.0.0",
        action="store",
        help="api service ip")
    parser.add_argument(
        "-m",
        "--model_pb",
        type=str,
        action="store",
        help="model proto in ONNX format or in Paddle framework format")
    parser.add_argument(
        "--logdir",
        required=True,
        action="store",
        dest="logdir",
        help="log file directory")
    parser.add_argument(
        "--cache_timeout",
        action="store",
        dest="cache_timeout",
        type=float,
        default=20,
        help="memory cache timeout duration in seconds, default 20",
    )
    parser.add_argument(
        "-L",
        "--language",
        type=str,
        default=default_language,
        action="store",
        help="set the default language")

    args = parser.parse_args()
    if not args.logdir:
        parser.print_help()
        sys.exit(-1)
    return args


# status, msg, data
def gen_result(status, msg, data):
    """
    :param status:
    :param msg:
    :return:
    """
    result = dict()
    result['status'] = status
    result['msg'] = msg
    result['data'] = data
    return result


def create_app(args):
    app = Flask(__name__, static_url_path="")
    # set static expires in a short time to reduce browser's memory usage.
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 30

    log_reader = LogReader(args.logdir)

    # mannully put graph's image on this path also works.
    graph_image_path = os.path.join(args.logdir, 'graph.jpg')
    # use a memory cache to reduce disk reading frequency.
    CACHE = MemCache(timeout=args.cache_timeout)
    cache_get = lib.cache_get(CACHE)

    @app.route("/")
    def index():
        language = args.language
        if not language in support_language:
            language = default_language
        if language == default_language:
            return redirect('/app/index', code=302)
        return redirect('/app/' + language + '/index', code=302)

    @app.route('/app/<path:filename>')
    def serve_static(filename):
        return send_from_directory(
            os.path.join(server_path, static_file_path), filename if re.search(r'\..+$', filename) else filename + '.html')

    @app.route('/graphs/image')
    def serve_graph():
        return send_file(os.path.join(os.getcwd(), graph_image_path))

    @app.route('/api/logdir')
    def logdir():
        result = gen_result(0, "", {"logdir": args.logdir})
        return Response(json.dumps(result), mimetype='application/json')

    @app.route('/api/runs')
    def runs():
        data = cache_get('/data/runs', lib.get_modes, log_reader)
        result = gen_result(0, "", data)
        return Response(json.dumps(result), mimetype='application/json')

    @app.route('/api/language')
    def language():
        data = args.language
        if not data in support_language:
            data = default_language
        result = gen_result(0, "", data)
        return Response(json.dumps(result), mimetype='application/json')

    @app.route("/api/scalars/tags")
    def scalar_tags():
        data = cache_get("/data/plugin/scalars/tags", try_call,
                         lib.get_scalar_tags, log_reader)
        result = gen_result(0, "", data)
        return Response(json.dumps(result), mimetype='application/json')

    @app.route("/api/images/tags")
    def image_tags():
        data = cache_get("/data/plugin/images/tags", try_call, lib.get_image_tags,
                         log_reader)
        result = gen_result(0, "", data)
        return Response(json.dumps(result), mimetype='application/json')

    @app.route("/api/audio/tags")
    def audio_tags():
        data = cache_get("/data/plugin/audio/tags", try_call, lib.get_audio_tags,
                         log_reader)
        result = gen_result(0, "", data)
        return Response(json.dumps(result), mimetype='application/json')

    @app.route("/api/histograms/tags")
    def histogram_tags():
        data = cache_get("/data/plugin/histograms/tags", try_call,
                         lib.get_histogram_tags, log_reader)
        result = gen_result(0, "", data)
        return Response(json.dumps(result), mimetype='application/json')

    @app.route("/api/texts/tags")
    def texts_tags():
        data = cache_get("/data/plugin/texts/tags", try_call,
                         lib.get_texts_tags, log_reader)
        result = gen_result(0, "", data)
        return Response(json.dumps(result), mimetype='application/json')

    @app.route('/api/scalars/list')
    def scalars():
        run = request.args.get('run')
        tag = request.args.get('tag')
        key = os.path.join('/data/plugin/scalars/scalars', run, tag)
        data = cache_get(key, try_call, lib.get_scalar, log_reader, run, tag)
        result = gen_result(0, "", data)
        return Response(json.dumps(result), mimetype='application/json')

    @app.route('/api/images/list')
    def images():
        mode = request.args.get('run')
        tag = request.args.get('tag')
        key = os.path.join('/data/plugin/images/images', mode, tag)

        data = cache_get(key, try_call, lib.get_image_tag_steps, log_reader, mode,
                         tag)
        result = gen_result(0, "", data)

        return Response(json.dumps(result), mimetype='application/json')

    @app.route('/api/images/image')
    def individual_image():
        mode = request.args.get('run')
        tag = request.args.get('tag')  # include a index
        step_index = int(request.args.get('index'))  # index of step

        key = os.path.join('/data/plugin/images/individualImage', mode, tag,
                           str(step_index))
        data = cache_get(key, try_call, lib.get_invididual_image, log_reader, mode,
                         tag, step_index)
        response = send_file(
            data, as_attachment=True, attachment_filename='img.png')
        return response

    @app.route('/api/histograms/list')
    def histogram():
        run = request.args.get('run')
        tag = request.args.get('tag')
        key = os.path.join('/data/plugin/histograms/histograms', run, tag)
        data = cache_get(key, try_call, lib.get_histogram, log_reader, run, tag)
        result = gen_result(0, "", data)
        return Response(json.dumps(result), mimetype='application/json')

    @app.route('/api/texts/list')
    def texts():
        run = request.args.get('run')
        tag = request.args.get('tag')
        key = os.path.join('/data/plugin/texts/texts', run, tag)
        data = cache_get(key, try_call, lib.get_texts, log_reader, run, tag)
        result = gen_result(0, "", data)
        return Response(json.dumps(result), mimetype='application/json')

    @app.route('/api/embeddings/embedding')
    def embeddings():
        run = request.args.get('run')
        dimension = request.args.get('dimension')
        reduction = request.args.get('reduction')
        key = os.path.join('/data/plugin/embeddings/embeddings', run, dimension, reduction)
        data = cache_get(key, try_call, lib.get_embeddings, log_reader, run, reduction, int(dimension))
        result = gen_result(0, "", data)
        return Response(json.dumps(result), mimetype='application/json')

    @app.route('/api/audio/list')
    def audio():
        mode = request.args.get('run')
        tag = request.args.get('tag')
        key = os.path.join('/data/plugin/audio/audio', mode, tag)

        data = cache_get(key, try_call, lib.get_audio_tag_steps, log_reader, mode,
                         tag)
        result = gen_result(0, "", data)

        return Response(json.dumps(result), mimetype='application/json')

    @app.route('/api/audio/audio')
    def individual_audio():
        mode = request.args.get('run')
        tag = request.args.get('tag')  # include a index
        step_index = int(request.args.get('index'))  # index of step

        key = os.path.join('/data/plugin/audio/individualAudio', mode, tag,
                           str(step_index))
        data = cache_get(key, try_call, lib.get_individual_audio, log_reader, mode,
                         tag, step_index)
        response = send_file(
            data, as_attachment=True, attachment_filename='audio.wav')
        return response

    @app.route('/api/graphs/graph')
    def graph():
        if model.is_onnx_model(args.model_pb):
            json_str = vdl_graph.draw_onnx_graph(args.model_pb)
        elif model.is_paddle_model(args.model_pb):
            json_str = vdl_graph.draw_paddle_graph(args.model_pb)
        else:
            json_str = {}
        data = {'data': json_str}

        result = gen_result(0, "", data)
        return Response(json.dumps(result), mimetype='application/json')

    return app


def run(logdir, host="0.0.0.0", port=8080, model_pb="", cache_timeout=20, language=default_language):
    args = ParseArgs(logdir=logdir, host=host, port=port, model_pb=model_pb, cache_timeout=cache_timeout, language=language)
    logger.info(" port=" + str(args.port))
    app = create_app(args)
    app.run(debug=False, host=args.host, port=args.port, threaded=True)


def main():
    args = parse_args()
    logger.info(" port=" + str(args.port))
    app = create_app(args=parse_args())
    app.run(debug=False, host=args.host, port=args.port, threaded=True)
