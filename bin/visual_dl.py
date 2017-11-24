""" entry point of visual_dl
"""
import json
import os
from optparse import OptionParser
from flask import send_from_directory

from flask import Flask
from flask import request

from visualdl.log import logger


app = Flask(__name__, static_url_path="")


def option_parser():
    """

    :return:
    """
    parser = OptionParser(usage="usage: visual_dl visual_dl.py "\
                          "-p port [options]")
    parser.add_option(
        "-p",
        "--port",
        default=8040,
        action="store",
        dest="port",
        help="rest api service port")
    return parser.parse_args()


# return data
# status, msg, data
def gen_result(status, msg):
    """

    :param status:
    :param msg:
    :return:
    """
    result = dict()
    result['status'] = status
    result['msg'] = msg
    result['data'] = {}
    return result

@app.route('/')
def root():
    return app.send_static_file('index.html')

@app.route('/js/<path:filename>')
def serve_static(filename):
    root_dir = os.path.dirname(os.getcwd())
    return send_from_directory(os.path.join('.', 'dist'), filename)

@app.route('/hello')
def index():
    """

    :return:
    """
    result = gen_result(0, "Hello, this is VisualDL!")
    return json.dumps(result)


if __name__ == '__main__':
    options, args = option_parser()
    logger.info(" port=" + str(options.port))
    app.run(debug=False, host="0.0.0.0", port=options.port)
