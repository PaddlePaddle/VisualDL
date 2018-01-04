import json
import os
import re
import sys
from optparse import OptionParser

from flask import (Flask, Response, redirect, request, send_file,
                   send_from_directory)

import graph
import lib
import storage
import visualdl.mock.data as mock_data
import visualdl.mock.tags as mock_tags
from visualdl.log import logger

app = Flask(__name__, static_url_path="")
# set static expires in a short time to reduce browser's memory usage.
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 30


def option_parser():
    """
    :return:
    """
    parser = OptionParser(usage="usage: visual_dl visual_dl.py "\
                          "-p port [options]")
    parser.add_option(
        "-p",
        "--port",
        type=int,
        default=8040,
        action="store",
        dest="port",
        help="api service port")
    parser.add_option(
        "-t",
        "--host",
        type=str,
        default="0.0.0.0",
        action="store",
        help="api service ip")
    parser.add_option(
        "--logdir", action="store", dest="logdir", help="log file directory")
    return parser.parse_args()


options, args = option_parser()
server_path = os.path.abspath(os.path.dirname(sys.argv[0]))
static_file_path = "./frontend/dist/"
mock_data_path = "./mock_data/"

log_reader = storage.LogReader(options.logdir)


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
    result = gen_result(0, "", lib.get_modes(log_reader))
    return Response(json.dumps(result), mimetype='application/json')


@app.route("/data/plugin/scalars/tags")
def scalar_tags():
    mode = request.args.get('mode')
    is_debug = bool(request.args.get('debug'))
    if is_debug:
        result = mock_tags.data()
    else:
        result = lib.get_scalar_tags(log_reader, mode)
    print 'scalar tags (mode: %s)' % mode, result
    result = gen_result(0, "", result)
    return Response(json.dumps(result), mimetype='application/json')


@app.route("/data/plugin/images/tags")
def image_tags():
    mode = request.args.get('run')
    result = lib.get_image_tags(log_reader)
    print 'image tags (mode: %s)'%mode, result
    result = gen_result(0, "", result)
    return Response(json.dumps(result), mimetype='application/json')


@app.route('/data/plugin/scalars/scalars')
def scalars():
    run = request.args.get('run')
    tag = request.args.get('tag')
    is_debug = bool(request.args.get('debug'))
    if is_debug:
        result = mock_data.sequence_data()
    else:
        result = lib.get_scalar(log_reader, run, tag)

    result = gen_result(0, "", result)
    return Response(json.dumps(result), mimetype='application/json')


@app.route('/data/plugin/images/images')
def images():
    mode = request.args.get('run')
    tag = request.args.get('tag')

    result = lib.get_image_tag_steps(log_reader, mode, tag)
    result = gen_result(0, "", result)

    return Response(json.dumps(result), mimetype='application/json')


@app.route('/data/plugin/images/individualImage')
def individual_image():
    mode = request.args.get('run')
    tag = request.args.get('tag')  # include a index
    step_index = int(request.args.get('index'))  # index of step
    offset = 0

    imagefile = lib.get_invididual_image(log_reader, mode, tag, step_index)
    response = send_file(
        imagefile, as_attachment=True, attachment_filename='img.png')
    return response


@app.route('/data/plugin/graphs/graph')
def graph():
    model_json = graph.load_model("")
    return Response(model_json, mimetype='application/json')


if __name__ == '__main__':
    logger.info(" port=" + str(options.port))
    app.run(debug=False, host=options.host, port=options.port)
