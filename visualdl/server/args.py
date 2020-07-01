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

import sys
import socket
from argparse import ArgumentParser

from visualdl.server.log import logger

default_host = None
default_port = 8040
default_cache_timeout = 20

default_public_path = '/app'


class DefaultArgs(object):
    def __init__(self, args):
        self.logdir = args.get('logdir')
        self.host = args.get('host', default_host)
        self.port = args.get('port', default_port)
        self.cache_timeout = args.get('cache_timeout', default_cache_timeout)
        self.language = args.get('language')
        self.public_path = args.get('public_path')
        self.api_only = args.get('api_only', False)
        self.open_browser = args.get('open_browser', False)
        self.model = args.get('model', '')


def validate_args(args):
    # if not in API mode, public path cannot be set to root path
    if not args.api_only and args.public_path == '/':
        logger.error('Public path cannot be set to root path.')
        sys.exit(-1)

    # public path must start with `/`
    if args.public_path is not None and not args.public_path.startswith('/'):
        logger.error('Public path should always start with a `/`.')
        sys.exit(-1)


def get_host(host=None, port=default_port):
    if not host:
        host = socket.getfqdn()
        try:
            socket.create_connection((host, port), timeout=1)
        except socket.error:
            host = 'localhost'
    return host


def format_args(args):
    validate_args(args)

    # set default public path according to API mode option
    if args.public_path is None:
        args.public_path = '' if args.api_only else default_public_path
    else:
        args.public_path = args.public_path.rstrip('/')

    # don't open browser in API mode
    if args.api_only:
        args.open_browser = False

    if not args.host:
        args.host = get_host(args.host, args.port)

    return args


class ParseArgs(object):
    def __init__(self, **kwargs):
        args = format_args(DefaultArgs(kwargs))

        self.logdir = args.logdir
        self.host = args.host
        self.port = args.port
        self.cache_timeout = args.cache_timeout
        self.language = args.language
        self.public_path = args.public_path
        self.api_only = args.api_only
        self.open_browser = args.open_browser
        self.model = args.model


def parse_args():
    """
    :return:
    """
    parser = ArgumentParser(description="VisualDL, a tool to visualize deep learning.")
    parser.add_argument(
        "--logdir",
        action="store",
        dest="logdir",
        nargs="+",
        help="log file directory")
    parser.add_argument(
        "-p",
        "--port",
        type=int,
        default=default_port,
        action="store",
        dest="port",
        help="api service port")
    parser.add_argument(
        "-t",
        "--host",
        type=str,
        default=default_host,
        action="store",
        help="api service ip")
    parser.add_argument(
        "--model",
        type=str,
        action="store",
        dest="model",
        default="",
        help="model file path")
    parser.add_argument(
        "--cache_timeout",
        action="store",
        dest="cache_timeout",
        type=float,
        default=default_cache_timeout,
        help="memory cache timeout duration in seconds, default 20", )
    parser.add_argument(
        "-L",
        "--language",
        type=str,
        action="store",
        default=None,
        help="set the default language")
    parser.add_argument(
        "-P",
        "--public-path",
        type=str,
        action="store",
        default=None,
        help="set public path"
    )
    parser.add_argument(
        "-A",
        "--api-only",
        action="store_true",
        default=False,
        help="serve api only"
    )

    args = parser.parse_args()

    return format_args(args)
