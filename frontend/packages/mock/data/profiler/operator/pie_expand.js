export default {
    order: ['infer_shape', 'compute', 'node_creation'],
    phase_type: [
        'cast trace_op',
        'transpose2 trace_op',
        'scale trace_op',
        'backward',
        'adam trace_op',
        'reshape2 trace_op',
        'conv2d_grad grad_node',
        'conv2d trace_op',
        'elementwise_add trace_op',
        'elementwise_add_grad grad_node',
        'relu trace_op',
        'pool2d trace_op',
        'fill_constant trace_op',
        'matmul_v2 trace_op',
        'pool2d_grad grad_node',
        'matmul_v2_grad grad_node',
        'relu_grad grad_node',
        'stack trace_op',
        'reduce_min trace_op',
        'mean trace_op',
        'others'
    ],
    data: [
        [
            0.36, 0.66, 1.84, 0, 0.28, 0.98, 0.03, 0.14, 0.15, 0.06, 0.03, 0.2, 0.04, 0.08, 0.16, 0.09, 0.03, 0.1, 0.07,
            0.03, 0.41
        ],
        [
            7.6, 7.43, 5.82, 0, 2.44, 1.21, 3.36, 2.5, 1.48, 1.65, 0.73, 0.71, 0.68, 0.6, 0.52, 0.46, 0.55, 0.44, 0.43,
            0.4, 1.96
        ],
        [0.06, 0.06, 0.06, 0, 0.02, 0.06, 0, 0.31, 0.46, 0, 0.29, 0.19, 0.01, 0.16, 0, 0, 0, 0.0, 0.0, 0.08, 0.2]
    ]
};
