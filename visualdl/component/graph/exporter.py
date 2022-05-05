import os
import json
import tempfile

import paddle


def export_graph(content_dict):
  '''
  Export model graph to json format.
  
  Args:
    content_dict(dict): All information we need to construct a model graph.
  
  
  '''

def translate_graph(graph, input_shape):
  with tempfile.TemporaryDirectory() as tmp:
    paddle.jit.save(graph, os.path.join(tmp, 'temp'), input_shape)
    result = analyse_model(os.path.join(tmp, 'temp.pdmodel'))
    return c