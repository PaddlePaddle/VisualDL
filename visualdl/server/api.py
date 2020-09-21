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

import functools
import json
import os

from visualdl.reader.reader import LogReader
from visualdl.server import lib
from visualdl.server.log import logger
from visualdl.python.cache import MemCache


error_retry_times = 3
error_sleep_time = 2  # seconds


def gen_result(data=None, status=0, msg=''):
    return {
        'status': status,
        'msg': msg,
        'data': data
    }


def result(mimetype='application/json', headers=None):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(self, *args, **kwargs):
            data = func(self, *args, **kwargs)
            if mimetype == 'application/json':
                data = json.dumps(gen_result(data))
            if callable(headers):
                headers_output = headers(self)
            else:
                headers_output = headers
            return data, mimetype, headers_output
        return wrapper
    return decorator


def try_call(function, *args, **kwargs):
    res = lib.retry(error_retry_times, function, error_sleep_time, *args, **kwargs)
    if not res:
        logger.error("Internal server error. Retry later.")
    return res


class Api(object):
    def __init__(self, logdir, model, cache_timeout):
        self._reader = LogReader(logdir)
        if model:
            self._reader.model = model
        self.model_name = os.path.basename(model)

        # use a memory cache to reduce disk reading frequency.
        cache = MemCache(timeout=cache_timeout)
        self._cache = lib.cache_get(cache)

    def _get(self, key, func, *args, **kwargs):
        return self._cache(key, func, self._reader, *args, **kwargs)

    def _get_with_retry(self, key, func, *args, **kwargs):
        return self._cache(key, try_call, func, self._reader, *args, **kwargs)

    @result()
    def components(self):
        return self._get('data/components', lib.get_components)

    @result()
    def runs(self):
        return self._get('data/runs', lib.get_runs)

    @result()
    def tags(self):
        return self._get('data/tags', lib.get_tags)

    @result()
    def logs(self):
        return self._get('data/logs', lib.get_logs)

    @result()
    def scalar_tags(self):
        return self._get_with_retry('data/plugin/scalars/tags', lib.get_scalar_tags)

    @result()
    def image_tags(self):
        return self._get_with_retry('data/plugin/images/tags', lib.get_image_tags)

    @result()
    def audio_tags(self):
        return self._get_with_retry('data/plugin/audio/tags', lib.get_audio_tags)

    @result()
    def embedding_tags(self):
        return self._get_with_retry('data/plugin/embeddings/tags', lib.get_embeddings_tags)

    @result()
    def pr_curve_tags(self):
        return self._get_with_retry('data/plugin/pr_curves/tags', lib.get_pr_curve_tags)

    @result()
    def scalar_list(self, run, tag):
        key = os.path.join('data/plugin/scalars/scalars', run, tag)
        return self._get_with_retry(key, lib.get_scalar, run, tag)

    @result()
    def image_list(self, mode, tag):
        key = os.path.join('data/plugin/images/images', mode, tag)
        return self._get_with_retry(key, lib.get_image_tag_steps, mode, tag)

    @result('image/png')
    def image_image(self, mode, tag, index=0):
        index = int(index)
        key = os.path.join('data/plugin/images/individualImage', mode, tag, str(index))
        return self._get_with_retry(key, lib.get_individual_image, mode, tag, index)

    @result()
    def audio_list(self, run, tag):
        key = os.path.join('data/plugin/audio/audio', run, tag)
        return self._get_with_retry(key, lib.get_audio_tag_steps, run, tag)

    @result('audio/wav')
    def audio_audio(self, run, tag, index=0):
        index = int(index)
        key = os.path.join('data/plugin/audio/individualAudio', run, tag, str(index))
        return self._get_with_retry(key, lib.get_individual_audio, run, tag, index)

    @result()
    def embedding_embedding(self, run, tag='default', reduction='pca', dimension=2):
        dimension = int(dimension)
        key = os.path.join('data/plugin/embeddings/embeddings', run, str(dimension), reduction)
        return self._get_with_retry(key, lib.get_embeddings, run, tag, reduction, dimension)

    @result()
    def histogram_tags(self):
        return self._get_with_retry('data/plugin/histogram/tags', lib.get_histogram_tags)

    @result()
    def histogram_list(self, run, tag):
        key = os.path.join('data/plugin/histogram/histogram', run, tag)
        return self._get_with_retry(key, lib.get_histogram, run, tag)

    @result()
    def pr_curves_pr_curve(self, run, tag):
        key = os.path.join('data/plugin/pr_curves/pr_curve', run, tag)
        return self._get_with_retry(key, lib.get_pr_curve, run, tag)

    @result()
    def pr_curves_steps(self, run):
        key = os.path.join('data/plugin/pr_curves/steps', run)
        return self._get_with_retry(key, lib.get_pr_curve_step, run)

    @result('application/octet-stream', lambda s: {"Content-Disposition": 'attachment; filename="%s"' % s.model_name} if len(s.model_name) else None)
    def graph_graph(self):
        key = os.path.join('data/plugin/graphs/graph')
        return self._get_with_retry(key, lib.get_graph)


def create_api_call(logdir, model, cache_timeout):
    api = Api(logdir, model, cache_timeout)
    routes = {
        'components': (api.components, []),
        'runs': (api.runs, []),
        'tags': (api.tags, []),
        'logs': (api.logs, []),
        'scalar/tags': (api.scalar_tags, []),
        'image/tags': (api.image_tags, []),
        'audio/tags': (api.audio_tags, []),
        'embedding/tags': (api.embedding_tags, []),
        'histogram/tags': (api.histogram_tags, []),
        'pr-curve/tags': (api.pr_curve_tags, []),
        'scalar/list': (api.scalar_list, ['run', 'tag']),
        'image/list': (api.image_list, ['run', 'tag']),
        'image/image': (api.image_image, ['run', 'tag', 'index']),
        'audio/list': (api.audio_list, ['run', 'tag']),
        'audio/audio': (api.audio_audio, ['run', 'tag', 'index']),
        'embedding/embedding': (api.embedding_embedding, ['run', 'tag', 'reduction', 'dimension']),
        'histogram/list': (api.histogram_list, ['run', 'tag']),
        'graph/graph': (api.graph_graph, []),
        'pr-curve/list': (api.pr_curves_pr_curve, ['run', 'tag']),
        'pr-curve/steps': (api.pr_curves_steps, ['run'])
    }

    def call(path: str, args):
        route = routes.get(path)
        if not route:
            return json.dumps(gen_result(status=1, msg='api not found')), 'application/json', None
        method, call_arg_names = route
        call_args = [args.get(name) for name in call_arg_names]
        return method(*call_args)

    return call
