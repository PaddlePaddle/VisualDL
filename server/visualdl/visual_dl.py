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
import storage
import graph

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

storage = storage.StorageReader(options.logdir)


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
    tag = request.args.get('tag')
    if is_debug:
        result = mock_tags.data()
    else:
        result = {}
        print 'modes', storage.modes()
        for mode in storage.modes():
            result[mode] = {}
            reader = storage.as_mode(mode)
            for tag in reader.tags("scalar"):
                result[mode][tag] = {
                    'displayName': reader.scalar(tag).caption(),
                    'description': ""
                }
    print 'tags', result
    result = gen_result(0, "", result)
    return Response(json.dumps(result), mimetype='application/json')


@app.route('/data/plugin/scalars/scalars')
def scalars():
    run = request.args.get('run')
    tag = request.args.get('tag')
    is_debug = bool(request.args.get('debug'))
    if is_debug:
        result = gen_result(0, "", mock_data.sequence_data())
    else:
        reader = storage.as_mode(run)
        scalar = reader.scalar(tag)

        records = scalar.records()
        ids = scalar.ids()
        timestamps = scalar.timestamps()

        result = zip(timestamps, ids, records)
        result = gen_result(0, "", result)

    return Response(json.dumps(result), mimetype='application/json')


@app.route('/data/plugin/graphs/graph')
def graph():
    model_json = graph.load_model("")
    return Response(model_json, mimetype='application/json')


if __name__ == '__main__':
    logger.info(" port=" + str(options.port))
    app.run(debug=False, host=options.host, port=options.port)
