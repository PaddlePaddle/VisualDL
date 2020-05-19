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
import multiprocessing
import threading
import re
import webbrowser
import requests
from visualdl.reader.reader import LogReader
from argparse import ArgumentParser
from visualdl.utils import update_util

from flask import (Flask, Response, redirect, request, send_file)
from flask_babel import Babel

import visualdl.server
from visualdl.server import lib
from visualdl.server.log import logger
from visualdl.server.template import Template
from visualdl.python.cache import MemCache

error_retry_times = 3
error_sleep_time = 2  # seconds

SERVER_DIR = os.path.join(visualdl.ROOT, 'server')

support_language = ["en", "zh"]
default_language = support_language[0]

server_path = os.path.abspath(os.path.dirname(sys.argv[0]))
template_file_path = os.path.join(SERVER_DIR, "./dist")
mock_data_path = os.path.join(SERVER_DIR, "./mock_data/")


class ParseArgs(object):
    def __init__(self,
                 logdir,
                 host="0.0.0.0",
                 port=8040,
                 model_pb="",
                 cache_timeout=20,
                 language=None,
                 public_path=None):
        self.logdir = logdir
        self.host = host
        self.port = port
        self.model_pb = model_pb
        self.cache_timeout = cache_timeout
        self.language = language
        self.public_path = public_path


def try_call(function, *args, **kwargs):
    res = lib.retry(error_retry_times, function, error_sleep_time, *args,
                    **kwargs)
    if not res:
        logger.error("Internal server error. Retry later.")
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
        "--logdir",
        required=True,
        action="store",
        dest="logdir",
        nargs="+",
        help="log file directory")
    parser.add_argument(
        "--cache_timeout",
        action="store",
        dest="cache_timeout",
        type=float,
        default=20,
        help="memory cache timeout duration in seconds, default 20", )
    parser.add_argument(
        "-L",
        "--language",
        type=str,
        action="store",
        help="set the default language")
    parser.add_argument(
        "-P",
        "--public-path",
        type=str,
        action="store",
        default="/app",
        help="set public path"
    )

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

    app.config['BABEL_DEFAULT_LOCALE'] = default_language
    babel = Babel(app)
    log_reader = LogReader(args.logdir)

    # use a memory cache to reduce disk reading frequency.
    CACHE = MemCache(timeout=args.cache_timeout)
    cache_get = lib.cache_get(CACHE)
    update_util.PbUpdater().start()

    public_path = args.public_path.rstrip('/')
    api_path = public_path + '/api'

    template = Template(os.path.join(server_path, template_file_path), PUBLIC_PATH=public_path.strip('/'))

    @babel.localeselector
    def get_locale():
        lang = args.language
        if not lang or lang not in support_language:
            lang = request.accept_languages.best_match(support_language)
        return lang

    @app.route("/")
    def base():
        return redirect(public_path, code=302)

    @app.route("/favicon.ico")
    def favicon():
        icon = os.path.join(template_file_path, 'favicon.ico')
        if os.path.exists(icon):
            return send_file(icon)
        return "file not found", 404

    @app.route(public_path + "/")
    def index():
        lang = get_locale()
        if lang == default_language:
            return redirect(public_path + '/index', code=302)
        return redirect(public_path + '/' + lang + '/index', code=302)

    @app.route(public_path + '/<path:filename>')
    def serve_static(filename):
        return template.render(filename if re.search(r'\..+$', filename) else filename + '.html')

    @app.route(api_path + "/components")
    def components():
        data = cache_get('/data/components', lib.get_components, log_reader)
        result = gen_result(0, "", data)
        return Response(json.dumps(result), mimetype='application/json')

    @app.route(api_path + '/runs')
    def runs():
        data = cache_get('/data/runs', lib.get_runs, log_reader)
        result = gen_result(0, "", data)
        return Response(json.dumps(result), mimetype='application/json')

    @app.route(api_path + '/tags')
    def tags():
        data = cache_get('/data/tags', lib.get_tags, log_reader)
        result = gen_result(0, "", data)
        return Response(json.dumps(result), mimetype='application/json')

    @app.route(api_path + '/logs')
    def logs():
        data = cache_get('/data/logs', lib.get_logs, log_reader)
        result = gen_result(0, "", data)
        return Response(json.dumps(result), mimetype='application/json')

    @app.route(api_path + "/scalars/tags")
    def scalar_tags():
        data = cache_get("/data/plugin/scalars/tags", try_call,
                         lib.get_scalar_tags, log_reader)
        result = gen_result(0, "", data)
        return Response(json.dumps(result), mimetype='application/json')

    @app.route(api_path + "/images/tags")
    def image_tags():
        data = cache_get("/data/plugin/images/tags", try_call,
                         lib.get_image_tags, log_reader)
        result = gen_result(0, "", data)
        return Response(json.dumps(result), mimetype='application/json')

    @app.route(api_path + "/audio/tags")
    def audio_tags():
        data = cache_get("/data/plugin/audio/tags", try_call,
                         lib.get_audio_tags, log_reader)
        result = gen_result(0, "", data)
        return Response(json.dumps(result), mimetype='application/json')

    @app.route(api_path + "/embeddings/tags")
    def embeddings_tags():
        data = cache_get("/data/plugin/embeddings/tags", try_call,
                         lib.get_embeddings_tags, log_reader)
        result = gen_result(0, "", data)
        return Response(json.dumps(result), mimetype='application/json')

    @app.route(api_path + '/scalars/list')
    def scalars():
        run = request.args.get('run')
        tag = request.args.get('tag')
        key = os.path.join('/data/plugin/scalars/scalars', run, tag)
        data = cache_get(key, try_call, lib.get_scalar, log_reader, run, tag)
        result = gen_result(0, "", data)
        return Response(json.dumps(result), mimetype='application/json')

    @app.route(api_path + '/images/list')
    def images():
        mode = request.args.get('run')
        tag = request.args.get('tag')
        key = os.path.join('/data/plugin/images/images', mode, tag)

        data = cache_get(key, try_call, lib.get_image_tag_steps, log_reader,
                         mode, tag)
        result = gen_result(0, "", data)

        return Response(json.dumps(result), mimetype='application/json')

    @app.route(api_path + '/images/image')
    def individual_image():
        mode = request.args.get('run')
        tag = request.args.get('tag')  # include a index
        step_index = int(request.args.get('index'))  # index of step

        key = os.path.join('/data/plugin/images/individualImage', mode, tag,
                           str(step_index))
        data = cache_get(key, try_call, lib.get_individual_image, log_reader,
                         mode, tag, step_index)
        return Response(data, mimetype="image/png")

    @app.route(api_path + '/embeddings/embedding')
    def embeddings():
        run = request.args.get('run')
        tag = request.args.get('tag', 'default')
        dimension = request.args.get('dimension')
        reduction = request.args.get('reduction')
        key = os.path.join('/data/plugin/embeddings/embeddings', run,
                           dimension, reduction)
        data = cache_get(key, try_call, lib.get_embeddings, log_reader, run,
                         tag, reduction, int(dimension))
        result = gen_result(0, "", data)
        return Response(json.dumps(result), mimetype='application/json')

    @app.route(api_path + '/audio/list')
    def audio():
        run = request.args.get('run')
        tag = request.args.get('tag')
        key = os.path.join('/data/plugin/audio/audio', run, tag)

        data = cache_get(key, try_call, lib.get_audio_tag_steps, log_reader,
                         run, tag)
        result = gen_result(0, "", data)

        return Response(json.dumps(result), mimetype='application/json')

    @app.route(api_path + '/audio/audio')
    def individual_audio():
        run = request.args.get('run')
        tag = request.args.get('tag')  # include a index
        step_index = int(request.args.get('index'))  # index of step

        key = os.path.join('/data/plugin/audio/individualAudio', run, tag,
                           str(step_index))
        data = cache_get(key, try_call, lib.get_individual_audio, log_reader,
                         run, tag, step_index)
        response = send_file(
            data, as_attachment=True, attachment_filename='audio.wav')
        return response

    return app


def _open_browser(app, index_url):
    while True:
        # noinspection PyBroadException
        try:
            requests.get(index_url)
            break
        except Exception:
            time.sleep(0.5)
    webbrowser.open(index_url)


def _run(logdir,
         host="127.0.0.1",
         port=8080,
         model_pb="",
         cache_timeout=20,
         language=None,
         public_path="/app",
         open_browser=False):
    args = ParseArgs(
        logdir=logdir,
        host=host,
        port=port,
        model_pb=model_pb,
        cache_timeout=cache_timeout,
        language=language,
        public_path=public_path)
    logger.info(" port=" + str(args.port))
    app = create_app(args)
    index_url = "http://" + host + ":" + str(port) + args.public_path
    if open_browser:
        threading.Thread(
            target=_open_browser, kwargs={"app": app,
                                          "index_url": index_url}).start()
    app.run(debug=False, host=args.host, port=args.port, threaded=False)


def run(logdir,
        host="127.0.0.1",
        port=8040,
        model_pb="",
        cache_timeout=20,
        language=None,
        public_path="/app",
        open_browser=False):
    kwarg = {
        "logdir": logdir,
        "host": host,
        "port": port,
        "model_pb": model_pb,
        "cache_timeout": cache_timeout,
        "language": language,
        "public_path": public_path,
        "open_browser": open_browser
    }

    p = multiprocessing.Process(target=_run, kwargs=kwarg)
    p.start()
    return p.pid


def main():
    args = parse_args()
    logger.info(" port=" + str(args.port))
    app = create_app(args)
    app.run(debug=False, host=args.host, port=args.port, threaded=False)


if __name__ == "__main__":
    main()
