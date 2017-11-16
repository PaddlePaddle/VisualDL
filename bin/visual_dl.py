""" entry point of visual_dl
"""
import json
from optparse import OptionParser

from flask import Flask
from flask import request

from visual_dl.log import logger

app = Flask(__name__)


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
def index():
    """

    :return:
    """
    result = gen_result(0, "Hello, this is VisualDL!")
    return json.dumps(result)


@app.route('/v1/scalar/start')
def start_board():
    """

    :return:
    """
    app_id = request.args.get('app_id')
    summary_dir = request.args.get('summary_dir')
    result = gen_result(status=1, msg="please set app_id and summary_dir")
    return json.dumps(result)


if __name__ == '__main__':
    options, args = option_parser()
    logger.info(" port=" + str(options.port))
    app.run(debug=False, host="0.0.0.0", port=options.port)
