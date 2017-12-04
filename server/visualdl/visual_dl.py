""" entry point of visual_dl
"""
import json
import os
import sys
from optparse import OptionParser

from flask import Flask, redirect
from flask import request
from flask import send_from_directory
from flask import Response

from visualdl.log import logger
import visualdl.mock.data as mock_data
import visualdl.mock.tags as mock_tags

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
    parser.add_option(
        "--logdir", action="store", dest="logdir", help="log file directory")
    return parser.parse_args()


options, args = option_parser()
server_path = os.path.abspath(os.path.dirname(sys.argv[0]))
static_file_path = "./frontend/dist/"
mock_data_path = "./mock_data/"


# return data
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


@app.route("/")
def index():
    return redirect('/static/index.html', code=302)


@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(
        os.path.join(server_path, static_file_path), filename)


@app.route('/data/logdir')
def logdir():
    result = gen_result(0, "", {"logdir": options.logdir})
    return Response(json.dumps(result), mimetype='application/json')


@app.route('/data/runs')
def runs():
    is_debug = bool(request.args.get('debug'))
    result = gen_result(0, "", ["train", "test"])
    return Response(json.dumps(result), mimetype='application/json')


@app.route("/data/plugin/scalars/tags")
def tags():
    is_debug = bool(request.args.get('debug'))
    result = gen_result(0, "", mock_tags.data())
    return Response(json.dumps(result), mimetype='application/json')


@app.route('/data/plugin/scalars/scalars')
def scalars():
    run = request.args.get('run')
    tag = request.args.get('tag')
    is_debug = bool(request.args.get('debug'))
    result = gen_result(0, "", mock_data.sequence_data())
    return Response(json.dumps(result), mimetype='application/json')


if __name__ == '__main__':
    logger.info(" port=" + str(options.port))
    app.run(debug=False, host="0.0.0.0", port=options.port)
