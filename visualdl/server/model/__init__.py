from __future__ import absolute_import
from .paddle.paddle2graph import is_paddle_model
from .onnx import is_onnx_model

__all__ = [is_paddle_model, is_onnx_model]
