import paddle
from paddle import ir

from visualdl import LogWriter

paddle.enable_static()

main_program, start_program = (
    paddle.static.Program(),
    paddle.static.Program(),
)
with paddle.static.program_guard(main_program, start_program):
    x = paddle.static.data("x", [1, 64, 64, 8], dtype="float32")
    y = paddle.static.data("y", [1, 64, 64, 8], dtype="float32")
    divide_out = paddle.divide(x, y)
    tanh_out = paddle.tanh(divide_out)
    conv2d = paddle.nn.Conv2D(8, 32, 1, bias_attr=False, data_format='NHWC')
    batch_norm = paddle.nn.BatchNorm(32, act='relu', data_layout='NHWC')
    out = batch_norm(conv2d(tanh_out))

newir_program = ir.translate_to_new_ir(main_program.desc)

with LogWriter(logdir="./log/program_test/") as writer:
    writer.add_graph(
        model=newir_program,
        input_spec=[paddle.static.InputSpec([-1, 1, 28, 28], 'float32')],
        verbose=True,
        is_newir=True)
