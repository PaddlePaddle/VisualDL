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

import os
import time
import sys
import multiprocessing
import threading
import re
import webbrowser
import requests

from visualdl.utils import update_util

from flask import (Flask, Response, redirect, request, send_file, make_response)
from flask_babel import Babel

import visualdl.server
from visualdl.server.api import create_api_call
from visualdl.server.args import (ParseArgs, parse_args)
from visualdl.server.log import logger
from visualdl.server.template import Template

SERVER_DIR = os.path.join(visualdl.ROOT, 'server')

support_language = ["en", "zh"]
default_language = support_language[0]

server_path = os.path.abspath(os.path.dirname(sys.argv[0]))
template_file_path = os.path.join(SERVER_DIR, "./dist")
mock_data_path = os.path.join(SERVER_DIR, "./mock_data/")


def create_app(args):
    app = Flask('visualdl', static_folder=None)
    # set static expires in a short time to reduce browser's memory usage.
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 30

    app.config['BABEL_DEFAULT_LOCALE'] = default_language
    babel = Babel(app)
    api_call = create_api_call(args.logdir, args.model, args.cache_timeout)

    update_util.PbUpdater().start()

    public_path = args.public_path
    api_path = public_path + '/api'

    if args.api_only:
        logger.info('Running in API mode, only {}/* will be served.'.format(api_path))

    @babel.localeselector
    def get_locale():
        lang = args.language
        if not lang or lang not in support_language:
            lang = request.accept_languages.best_match(support_language)
        return lang

    if not args.api_only:

        template = Template(os.path.join(server_path, template_file_path), PUBLIC_PATH=public_path.lstrip('/'))

        @app.route('/')
        def base():
            return redirect(public_path, code=302)

        @app.route('/favicon.ico')
        def favicon():
            icon = os.path.join(template_file_path, 'favicon.ico')
            if os.path.exists(icon):
                return send_file(icon)
            return 'file not found', 404

        @app.route(public_path + '/')
        def index():
            lang = get_locale()
            if lang == default_language:
                return redirect(public_path + '/index', code=302)
            lang = default_language if lang is None else lang
            return redirect(public_path + '/' + lang + '/index', code=302)

        @app.route(public_path + '/<path:filename>')
        def serve_static(filename):
            return template.render(filename if re.search(r'\..+$', filename) else filename + '.html')

    @app.route(api_path + '/<path:method>')
    def serve_api(method):
        data, mimetype, headers = api_call(method, request.args)
        return make_response(Response(data, mimetype=mimetype, headers=headers))
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


def _run(**kwargs):
    args = ParseArgs(**kwargs)
    logger.info(' port=' + str(args.port))
    app = create_app(args)
    if not args.api_only:
        index_url = 'http://' + args.host + ':' + str(args.port) + args.public_path
        if kwargs.get('open_browser', False):
            threading.Thread(
                target=_open_browser, kwargs={'app': app, 'index_url': index_url}).start()
    app.run(debug=False, host=args.host, port=args.port, threaded=False)


def run(logdir=None, **options):
    kwargs = {
        'logdir': logdir
    }
    kwargs.update(options)
    p = multiprocessing.Process(target=_run, kwargs=kwargs)
    p.start()
    return p.pid


def main():
    args = parse_args()
    logger.info(' port=' + str(args.port))
    app = create_app(args)
    app.run(debug=False, host=args.host, port=args.port, threaded=False)


if __name__ == '__main__':
    main()
