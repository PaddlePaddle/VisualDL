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
import gzip
import json
import os
from io import BytesIO

from flask import request

from visualdl import LogReader
from visualdl.python.cache import MemCache
from visualdl.reader.graph_reader import GraphReader
from visualdl.server import lib
from visualdl.server.client_manager import ClientManager
from visualdl.server.log import logger

error_retry_times = 3
error_sleep_time = 2  # seconds


def gen_result(data=None, status=0, msg=''):
    return {'status': status, 'msg': msg, 'data': data}


def result(mimetype='application/json', headers=None):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(self, *args, **kwargs):
            data = None
            status = 0
            msg = ''
            try:
                data = func(self, *args, **kwargs)
            except Exception as e:
                msg = '{}'.format(e)
                status = -1
            if mimetype == 'application/json':
                data = json.dumps(gen_result(data, status, msg))
            if callable(headers):
                headers_output = headers(self)
            else:
                headers_output = headers
                if headers is not None:
                    if 'content-encoding' in headers:
                        buf = BytesIO()
                        with gzip.GzipFile(mode='wb', fileobj=buf) as fp:
                            gzip_value = data.encode()
                            fp.write(gzip_value)
                        data = buf.getvalue()
            return data, mimetype, headers_output

        return wrapper

    return decorator


def try_call(function, *args, **kwargs):
    res = lib.retry(error_retry_times, function, error_sleep_time, *args,
                    **kwargs)
    if not res:
        logger.error("Internal server error. Retry later.")
    return res


class Api(object):
    def __init__(self, logdir, model, cache_timeout):
        self._reader = LogReader(logdir)
        self._graph_reader = GraphReader(logdir)
        self._graph_reader.set_displayname(self._reader)
        if model:
            if 'vdlgraph' in model:
                self._graph_reader.set_input_graph(model)
            self._reader.model = model
            self.model_name = os.path.basename(model)
        else:
            self.model_name = ''
        self.graph_reader_client_manager = ClientManager(self._graph_reader)
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

    def component_tabs(self):
        '''
        Get all component tabs supported by readers in Api.
        '''
        tabs = set()
        tabs.update(self._reader.component_tabs(update=True))
        tabs.update(self._graph_reader.component_tabs(update=True))
        return tabs

    @result()
    def runs(self):
        return self._get('data/runs', lib.get_runs)

    @result()
    def graph_runs(self):
        client_ip = request.remote_addr
        graph_reader = self.graph_reader_client_manager.get_data(client_ip)
        return lib.get_graph_runs(graph_reader)

    @result()
    def tags(self):
        return self._get('data/tags', lib.get_tags)

    @result()
    def logs(self):
        return self._get('data/logs', lib.get_logs)

    @result()
    def scalar_tags(self):
        return self._get_with_retry('data/plugin/scalars/tags',
                                    lib.get_scalar_tags)

    @result()
    def scalars_tags(self):
        return self._get_with_retry('data/plugin/multiscalars/tags',
                                    lib.get_scalars_tags)

    @result()
    def image_tags(self):
        return self._get_with_retry('data/plugin/images/tags',
                                    lib.get_image_tags)

    @result()
    def text_tags(self):
        return self._get_with_retry('data/plugin/text/tags', lib.get_text_tags)

    @result()
    def audio_tags(self):
        return self._get_with_retry('data/plugin/audio/tags',
                                    lib.get_audio_tags)

    @result()
    def embedding_tags(self):
        return self._get_with_retry('data/plugin/embeddings/tags',
                                    lib.get_embeddings_tags)

    @result()
    def pr_curve_tags(self):
        return self._get_with_retry('data/plugin/pr_curves/tags',
                                    lib.get_pr_curve_tags)

    @result()
    def roc_curve_tags(self):
        return self._get_with_retry('data/plugin/roc_curves/tags',
                                    lib.get_roc_curve_tags)

    @result()
    def hparam_importance(self):
        return self._get_with_retry('data/plugin/hparams/importance',
                                    lib.get_hparam_importance)

    @result()
    def hparam_indicator(self):
        return self._get_with_retry('data/plugin/hparams/indicators',
                                    lib.get_hparam_indicator)

    @result()
    def hparam_list(self):
        return self._get_with_retry('data/plugin/hparams/list',
                                    lib.get_hparam_list)

    @result()
    def hparam_metric(self, run, metric):
        key = os.path.join('data/plugin/hparams/metric', run, metric)
        return self._get_with_retry(key, lib.get_hparam_metric, run, metric)

    @result('text/csv')
    def hparam_data(self, type='tsv'):
        key = os.path.join('data/plugin/hparams/data', type)
        return self._get_with_retry(key, lib.get_hparam_data, type)

    @result()
    def scalar_list(self, run, tag):
        key = os.path.join('data/plugin/scalars/scalars', run, tag)
        return self._get_with_retry(key, lib.get_scalar, run, tag)

    @result()
    def scalars_list(self, run, tag, sub_tag):
        key = os.path.join('data/plugin/multiscalars/scalars', run, tag,
                           sub_tag)
        return self._get_with_retry(key, lib.get_scalars, run, tag, sub_tag)

    @result('text/csv')
    def scalar_data(self, run, tag, type='tsv'):
        key = os.path.join('data/plugin/scalars/data', run, tag, type)
        return self._get_with_retry(key, lib.get_scalar_data, run, tag, type)

    @result('text/csv')
    def scalars_data(self, run, tag, sub_tag, type='tsv'):
        key = os.path.join('data/plugin/multiscalars/data', run, tag, sub_tag,
                           type)
        return self._get_with_retry(key, lib.get_scalars_data, run, tag,
                                    sub_tag, type)

    @result()
    def image_list(self, mode, tag):
        key = os.path.join('data/plugin/images/images', mode, tag)
        return self._get_with_retry(key, lib.get_image_tag_steps, mode, tag)

    @result('image/png')
    def image_image(self, mode, tag, index=0):
        index = int(index)
        key = os.path.join('data/plugin/images/individualImage', mode, tag,
                           str(index))
        return self._get_with_retry(key, lib.get_individual_image, mode, tag,
                                    index)

    @result()
    def text_list(self, mode, tag):
        key = os.path.join('data/plugin/text/text', mode, tag)
        return self._get_with_retry(key, lib.get_text_tag_steps, mode, tag)

    @result('text/plain')
    def text_text(self, mode, tag, index=0):
        index = int(index)
        key = os.path.join('data/plugin/text/individualText', mode, tag,
                           str(index))
        return self._get_with_retry(key, lib.get_individual_text, mode, tag,
                                    index)

    @result()
    def audio_list(self, run, tag):
        key = os.path.join('data/plugin/audio/audio', run, tag)
        return self._get_with_retry(key, lib.get_audio_tag_steps, run, tag)

    @result('audio/wav')
    def audio_audio(self, run, tag, index=0):
        index = int(index)
        key = os.path.join('data/plugin/audio/individualAudio', run, tag,
                           str(index))
        return self._get_with_retry(key, lib.get_individual_audio, run, tag,
                                    index)

    @result()
    def embedding_embedding(self,
                            run,
                            tag='default',
                            reduction='pca',
                            dimension=2):
        dimension = int(dimension)
        key = os.path.join('data/plugin/embeddings/embeddings', run,
                           str(dimension), reduction)
        return self._get_with_retry(key, lib.get_embeddings, run, tag,
                                    reduction, dimension)

    @result()
    def embedding_list(self):
        return self._get_with_retry('data/plugin/embeddings/list',
                                    lib.get_embeddings_list)

    @result('text/tab-separated-values')
    def embedding_metadata(self, name):
        key = os.path.join('data/plugin/embeddings/metadata', name)
        return self._get_with_retry(key, lib.get_embedding_labels, name)

    @result('application/octet-stream')
    def embedding_tensor(self, name):
        key = os.path.join('data/plugin/embeddings/tensor', name)
        return self._get_with_retry(key, lib.get_embedding_tensors, name)

    @result()
    def histogram_tags(self):
        return self._get_with_retry('data/plugin/histogram/tags',
                                    lib.get_histogram_tags)

    @result()
    def histogram_list(self, run, tag):
        key = os.path.join('data/plugin/histogram/histogram', run, tag)
        return self._get_with_retry(key, lib.get_histogram, run, tag)

    @result()
    def pr_curves_pr_curve(self, run, tag):
        key = os.path.join('data/plugin/pr_curves/pr_curve', run, tag)
        return self._get_with_retry(key, lib.get_pr_curve, run, tag)

    @result()
    def roc_curves_roc_curve(self, run, tag):
        key = os.path.join('data/plugin/roc_curves/roc_curve', run, tag)
        return self._get_with_retry(key, lib.get_roc_curve, run, tag)

    @result()
    def pr_curves_steps(self, run):
        key = os.path.join('data/plugin/pr_curves/steps', run)
        return self._get_with_retry(key, lib.get_pr_curve_step, run)

    @result()
    def roc_curves_steps(self, run):
        key = os.path.join('data/plugin/roc_curves/steps', run)
        return self._get_with_retry(key, lib.get_roc_curve_step, run)

    @result('application/octet-stream', lambda s: {
        "Content-Disposition": 'attachment; filename="%s"' % s.model_name
    } if len(s.model_name) else None)
    def graph_static_graph(self):
        key = os.path.join('data/plugin/graphs/static_graph')
        return self._get_with_retry(key, lib.get_static_graph)

    @result()
    def graph_graph(self, run, expand_all, refresh):
        client_ip = request.remote_addr
        graph_reader = self.graph_reader_client_manager.get_data(client_ip)
        if expand_all is not None:
            if (expand_all.lower() == 'true'):
                expand_all = True
            else:
                expand_all = False
        else:
            expand_all = False
        if refresh is not None:
            if (refresh.lower() == 'true'):
                refresh = True
            else:
                refresh = False
        else:
            refresh = True
        return lib.get_graph(
            graph_reader, run, expand_all=expand_all, refresh=refresh)

    @result()
    def graph_upload(self):
        client_ip = request.remote_addr
        graph_reader = self.graph_reader_client_manager.get_data(client_ip)
        files = request.files
        if 'file' in files:
            file_handle = request.files['file']
            if 'pdmodel' in file_handle.filename:
                graph_reader.set_input_graph(file_handle.stream.read(),
                                             'pdmodel')
            elif 'vdlgraph' in file_handle.filename:
                graph_reader.set_input_graph(file_handle.stream.read(),
                                             'vdlgraph')

    @result()
    def graph_manipulate(self, run, nodeid, expand, keep_state):
        client_ip = request.remote_addr
        graph_reader = self.graph_reader_client_manager.get_data(client_ip)
        if expand is not None:
            if (expand.lower() == 'true'):
                expand = True
            else:
                expand = False
        else:
            expand = False
        if keep_state is not None:
            if (keep_state.lower() == 'true'):
                keep_state = True
            else:
                keep_state = False
        else:
            keep_state = False
        return lib.get_graph(graph_reader, run, nodeid, expand, keep_state)

    @result()
    def graph_search(self, run, nodeid, keep_state, is_node):
        client_ip = request.remote_addr
        graph_reader = self.graph_reader_client_manager.get_data(client_ip)
        if keep_state is not None:
            if (keep_state.lower() == 'true'):
                keep_state = True
            else:
                keep_state = False
        else:
            keep_state = False

        if is_node is not None:
            if (is_node.lower() == 'true'):
                is_node = True
            else:
                is_node = False
        else:
            is_node = False
        return lib.get_graph_search(graph_reader, run, nodeid, keep_state,
                                    is_node)

    @result()
    def graph_get_all_nodes(self, run):
        client_ip = request.remote_addr
        graph_reader = self.graph_reader_client_manager.get_data(client_ip)
        return lib.get_graph_all_nodes(graph_reader, run)


@result()
def get_component_tabs(*apis, vdl_args, request_args):
    '''
    Get component tabs in all apis, so tabs can be presented according to existed data in frontend.
    '''
    all_tabs = set()
    if vdl_args.component_tabs:
        return list(vdl_args.component_tabs)
    if vdl_args.logdir:
        for api in apis:
            all_tabs.update(api('component_tabs', request_args))
            all_tabs.add('static_graph')
    else:
        return ['static_graph']
    return list(all_tabs)


def create_api_call(logdir, model, cache_timeout):
    api = Api(logdir, model, cache_timeout)
    routes = {
        'components': (api.components, []),
        'runs': (api.runs, []),
        'graph_runs': (api.graph_runs, []),
        'tags': (api.tags, []),
        'logs': (api.logs, []),
        'scalar/tags': (api.scalar_tags, []),
        'scalars/tags': (api.scalars_tags, []),
        'image/tags': (api.image_tags, []),
        'text/tags': (api.text_tags, []),
        'audio/tags': (api.audio_tags, []),
        'embedding/tags': (api.embedding_tags, []),
        'histogram/tags': (api.histogram_tags, []),
        'pr-curve/tags': (api.pr_curve_tags, []),
        'roc-curve/tags': (api.roc_curve_tags, []),
        'scalar/list': (api.scalar_list, ['run', 'tag']),
        'scalars/list': (api.scalars_list, ['run', 'tag', 'sub_tag']),
        'scalar/data': (api.scalar_data, ['run', 'tag', 'type']),
        'scalars/data': (api.scalars_data, ['run', 'tag', 'sub_tag', 'type']),
        'image/list': (api.image_list, ['run', 'tag']),
        'image/image': (api.image_image, ['run', 'tag', 'index']),
        'text/list': (api.text_list, ['run', 'tag']),
        'text/text': (api.text_text, ['run', 'tag', 'index']),
        'audio/list': (api.audio_list, ['run', 'tag']),
        'audio/audio': (api.audio_audio, ['run', 'tag', 'index']),
        'embedding/embedding': (api.embedding_embedding,
                                ['run', 'tag', 'reduction', 'dimension']),
        'embedding/list': (api.embedding_list, []),
        'embedding/tensor': (api.embedding_tensor, ['name']),
        'embedding/metadata': (api.embedding_metadata, ['name']),
        'histogram/list': (api.histogram_list, ['run', 'tag']),
        'graph/graph': (api.graph_graph, ['run', 'expand_all', 'refresh']),
        'graph/static_graph': (api.graph_static_graph, []),
        'graph/upload': (api.graph_upload, []),
        'graph/search': (api.graph_search,
                         ['run', 'nodeid', 'keep_state', 'is_node']),
        'graph/get_all_nodes': (api.graph_get_all_nodes, ['run']),
        'graph/manipulate': (api.graph_manipulate,
                             ['run', 'nodeid', 'expand', 'keep_state']),
        'pr-curve/list': (api.pr_curves_pr_curve, ['run', 'tag']),
        'roc-curve/list': (api.roc_curves_roc_curve, ['run', 'tag']),
        'pr-curve/steps': (api.pr_curves_steps, ['run']),
        'roc-curve/steps': (api.roc_curves_steps, ['run']),
        'hparams/importance': (api.hparam_importance, []),
        'hparams/data': (api.hparam_data, ['type']),
        'hparams/indicators': (api.hparam_indicator, []),
        'hparams/list': (api.hparam_list, []),
        'hparams/metric': (api.hparam_metric, ['run', 'metric']),
        'component_tabs': (api.component_tabs, [])
    }

    def call(path: str, args):
        route = routes.get(path)
        if not route:
            return json.dumps(gen_result(
                status=1, msg='api not found')), 'application/json', None
        method, call_arg_names = route
        call_args = [args.get(name) for name in call_arg_names]
        return method(*call_args)

    return call
