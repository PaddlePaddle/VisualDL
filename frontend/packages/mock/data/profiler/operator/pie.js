export default {
    column_name: ['name', 'calls', 'total_time', 'avg_time', 'max_time', 'min_time', 'ratio'],
    cpu: [
        {name: 'backward', calls: 7, total_time: 10.51, avg_time: 1.5, max_time: 2.09, min_time: 1.35, ratio: 12.0},
        {
            name: 'conv2d_grad grad_node',
            calls: 21,
            total_time: 4.16,
            avg_time: 0.2,
            max_time: 0.45,
            min_time: 0.12,
            ratio: 4.75
        },
        {
            name: 'conv2d trace_op',
            calls: 21,
            total_time: 3.6,
            avg_time: 0.17,
            max_time: 0.57,
            min_time: 0.14,
            ratio: 4.11
        },
        {
            name: 'transpose2 trace_op',
            calls: 229,
            total_time: 12.02,
            avg_time: 0.05,
            max_time: 0.16,
            min_time: 0.05,
            ratio: 13.72
        },
        {
            name: 'elementwise_add_grad grad_node',
            calls: 35,
            total_time: 2.39,
            avg_time: 0.07,
            max_time: 0.15,
            min_time: 0.04,
            ratio: 2.73
        },
        {
            name: 'elementwise_add trace_op',
            calls: 35,
            total_time: 2.89,
            avg_time: 0.08,
            max_time: 0.23,
            min_time: 0.06,
            ratio: 3.3
        },
        {
            name: 'pool2d_grad grad_node',
            calls: 14,
            total_time: 1.02,
            avg_time: 0.07,
            max_time: 0.12,
            min_time: 0.06,
            ratio: 1.17
        },
        {
            name: 'adam trace_op',
            calls: 70,
            total_time: 7.91,
            avg_time: 0.11,
            max_time: 3.92,
            min_time: 0.05,
            ratio: 9.03
        },
        {
            name: 'relu_grad grad_node',
            calls: 28,
            total_time: 0.94,
            avg_time: 0.03,
            max_time: 0.07,
            min_time: 0.02,
            ratio: 1.08
        },
        {
            name: 'cast trace_op',
            calls: 235,
            total_time: 12.38,
            avg_time: 0.05,
            max_time: 0.09,
            min_time: 0.04,
            ratio: 14.14
        },
        {
            name: 'scale trace_op',
            calls: 228,
            total_time: 11.84,
            avg_time: 0.05,
            max_time: 0.1,
            min_time: 0.05,
            ratio: 13.52
        },
        {
            name: 'matmul_v2 trace_op',
            calls: 14,
            total_time: 1.1,
            avg_time: 0.08,
            max_time: 0.19,
            min_time: 0.06,
            ratio: 1.25
        },
        {
            name: 'matmul_v2_grad grad_node',
            calls: 14,
            total_time: 0.95,
            avg_time: 0.07,
            max_time: 0.11,
            min_time: 0.05,
            ratio: 1.09
        },
        {
            name: 'pool2d trace_op',
            calls: 14,
            total_time: 1.45,
            avg_time: 0.1,
            max_time: 0.25,
            min_time: 0.09,
            ratio: 1.65
        },
        {
            name: 'relu trace_op',
            calls: 28,
            total_time: 1.64,
            avg_time: 0.06,
            max_time: 0.16,
            min_time: 0.05,
            ratio: 1.87
        },
        {
            name: 'stack trace_op',
            calls: 7,
            total_time: 0.71,
            avg_time: 0.1,
            max_time: 0.14,
            min_time: 0.09,
            ratio: 0.81
        },
        {
            name: 'softmax_with_cross_entropy trace_op',
            calls: 7,
            total_time: 0.56,
            avg_time: 0.08,
            max_time: 0.12,
            min_time: 0.07,
            ratio: 0.64
        },
        {
            name: 'fill_constant trace_op',
            calls: 21,
            total_time: 1.21,
            avg_time: 0.06,
            max_time: 0.11,
            min_time: 0.05,
            ratio: 1.39
        },
        {
            name: 'softmax_with_cross_entropy_grad grad_node',
            calls: 7,
            total_time: 0.28,
            avg_time: 0.04,
            max_time: 0.06,
            min_time: 0.04,
            ratio: 0.32
        },
        {
            name: 'reduce_max trace_op',
            calls: 7,
            total_time: 0.56,
            avg_time: 0.08,
            max_time: 0.1,
            min_time: 0.07,
            ratio: 0.63
        },
        {name: 'mean trace_op', calls: 7, total_time: 0.61, avg_time: 0.09, max_time: 0.11, min_time: 0.08, ratio: 0.7},
        {
            name: 'reduce_min trace_op',
            calls: 7,
            total_time: 0.64,
            avg_time: 0.09,
            max_time: 0.13,
            min_time: 0.08,
            ratio: 0.73
        },
        {
            name: 'not_equal trace_op',
            calls: 7,
            total_time: 0.43,
            avg_time: 0.06,
            max_time: 0.1,
            min_time: 0.05,
            ratio: 0.49
        },
        {
            name: 'elementwise_mul trace_op',
            calls: 7,
            total_time: 0.35,
            avg_time: 0.05,
            max_time: 0.08,
            min_time: 0.04,
            ratio: 0.4
        },
        {
            name: 'greater_equal trace_op',
            calls: 7,
            total_time: 0.38,
            avg_time: 0.05,
            max_time: 0.07,
            min_time: 0.05,
            ratio: 0.43
        },
        {
            name: 'less_than trace_op',
            calls: 7,
            total_time: 0.38,
            avg_time: 0.05,
            max_time: 0.07,
            min_time: 0.05,
            ratio: 0.43
        },
        {
            name: 'mean_grad grad_node',
            calls: 7,
            total_time: 0.28,
            avg_time: 0.04,
            max_time: 0.06,
            min_time: 0.03,
            ratio: 0.32
        },
        {
            name: 'flatten_contiguous_range_grad grad_node',
            calls: 7,
            total_time: 0.11,
            avg_time: 0.02,
            max_time: 0.02,
            min_time: 0.01,
            ratio: 0.13
        },
        {
            name: 'flatten_contiguous_range trace_op',
            calls: 7,
            total_time: 0.27,
            avg_time: 0.04,
            max_time: 0.06,
            min_time: 0.03,
            ratio: 0.31
        },
        {
            name: 'unsqueeze2 trace_op',
            calls: 7,
            total_time: 0.34,
            avg_time: 0.05,
            max_time: 0.13,
            min_time: 0.03,
            ratio: 0.39
        },
        {
            name: 'reshape2 trace_op',
            calls: 229,
            total_time: 5.66,
            avg_time: 0.02,
            max_time: 0.13,
            min_time: 0.02,
            ratio: 6.46
        }
    ],
    gpu: [
        {name: 'backward', calls: 7, total_time: 5.14, avg_time: 0.73, max_time: 0.74, min_time: 0.73, ratio: 34.97},
        {
            name: 'conv2d_grad grad_node',
            calls: 21,
            total_time: 3.57,
            avg_time: 0.17,
            max_time: 0.21,
            min_time: 0.13,
            ratio: 24.27
        },
        {
            name: 'conv2d trace_op',
            calls: 21,
            total_time: 1.19,
            avg_time: 0.06,
            max_time: 0.08,
            min_time: 0.04,
            ratio: 8.11
        },
        {
            name: 'transpose2 trace_op',
            calls: 229,
            total_time: 0.67,
            avg_time: 0.0,
            max_time: 0.01,
            min_time: 0.0,
            ratio: 4.57
        },
        {
            name: 'elementwise_add_grad grad_node',
            calls: 35,
            total_time: 0.46,
            avg_time: 0.01,
            max_time: 0.03,
            min_time: 0.0,
            ratio: 3.14
        },
        {
            name: 'elementwise_add trace_op',
            calls: 35,
            total_time: 0.45,
            avg_time: 0.01,
            max_time: 0.04,
            min_time: 0.0,
            ratio: 3.07
        },
        {
            name: 'pool2d_grad grad_node',
            calls: 14,
            total_time: 0.43,
            avg_time: 0.03,
            max_time: 0.04,
            min_time: 0.02,
            ratio: 2.91
        },
        {
            name: 'adam trace_op',
            calls: 70,
            total_time: 0.41,
            avg_time: 0.01,
            max_time: 0.01,
            min_time: 0.0,
            ratio: 2.81
        },
        {
            name: 'relu_grad grad_node',
            calls: 28,
            total_time: 0.36,
            avg_time: 0.01,
            max_time: 0.04,
            min_time: 0.0,
            ratio: 2.44
        },
        {name: 'cast trace_op', calls: 235, total_time: 0.33, avg_time: 0.0, max_time: 0.0, min_time: 0.0, ratio: 2.22},
        {
            name: 'scale trace_op',
            calls: 228,
            total_time: 0.31,
            avg_time: 0.0,
            max_time: 0.0,
            min_time: 0.0,
            ratio: 2.08
        },
        {
            name: 'matmul_v2 trace_op',
            calls: 14,
            total_time: 0.28,
            avg_time: 0.02,
            max_time: 0.03,
            min_time: 0.01,
            ratio: 1.93
        },
        {
            name: 'matmul_v2_grad grad_node',
            calls: 14,
            total_time: 0.28,
            avg_time: 0.02,
            max_time: 0.02,
            min_time: 0.02,
            ratio: 1.93
        },
        {
            name: 'pool2d trace_op',
            calls: 14,
            total_time: 0.27,
            avg_time: 0.02,
            max_time: 0.03,
            min_time: 0.01,
            ratio: 1.87
        },
        {name: 'relu trace_op', calls: 28, total_time: 0.26, avg_time: 0.01, max_time: 0.03, min_time: 0.0, ratio: 1.8},
        {name: 'stack trace_op', calls: 7, total_time: 0.03, avg_time: 0.0, max_time: 0.0, min_time: 0.0, ratio: 0.21},
        {
            name: 'softmax_with_cross_entropy trace_op',
            calls: 7,
            total_time: 0.03,
            avg_time: 0.0,
            max_time: 0.0,
            min_time: 0.0,
            ratio: 0.2
        },
        {
            name: 'fill_constant trace_op',
            calls: 21,
            total_time: 0.03,
            avg_time: 0.0,
            max_time: 0.0,
            min_time: 0.0,
            ratio: 0.2
        },
        {
            name: 'softmax_with_cross_entropy_grad grad_node',
            calls: 7,
            total_time: 0.03,
            avg_time: 0.0,
            max_time: 0.0,
            min_time: 0.0,
            ratio: 0.2
        },
        {
            name: 'reduce_max trace_op',
            calls: 7,
            total_time: 0.03,
            avg_time: 0.0,
            max_time: 0.0,
            min_time: 0.0,
            ratio: 0.18
        },
        {name: 'mean trace_op', calls: 7, total_time: 0.03, avg_time: 0.0, max_time: 0.0, min_time: 0.0, ratio: 0.17},
        {
            name: 'reduce_min trace_op',
            calls: 7,
            total_time: 0.02,
            avg_time: 0.0,
            max_time: 0.0,
            min_time: 0.0,
            ratio: 0.16
        },
        {
            name: 'not_equal trace_op',
            calls: 7,
            total_time: 0.02,
            avg_time: 0.0,
            max_time: 0.0,
            min_time: 0.0,
            ratio: 0.13
        },
        {
            name: 'elementwise_mul trace_op',
            calls: 7,
            total_time: 0.02,
            avg_time: 0.0,
            max_time: 0.0,
            min_time: 0.0,
            ratio: 0.13
        },
        {
            name: 'greater_equal trace_op',
            calls: 7,
            total_time: 0.01,
            avg_time: 0.0,
            max_time: 0.0,
            min_time: 0.0,
            ratio: 0.1
        },
        {
            name: 'less_than trace_op',
            calls: 7,
            total_time: 0.01,
            avg_time: 0.0,
            max_time: 0.0,
            min_time: 0.0,
            ratio: 0.1
        },
        {
            name: 'mean_grad grad_node',
            calls: 7,
            total_time: 0.01,
            avg_time: 0.0,
            max_time: 0.0,
            min_time: 0.0,
            ratio: 0.1
        },
        {
            name: 'flatten_contiguous_range_grad grad_node',
            calls: 7,
            total_time: 0.0,
            avg_time: 0.0,
            max_time: 0.0,
            min_time: 0.0,
            ratio: 0.0
        },
        {
            name: 'flatten_contiguous_range trace_op',
            calls: 7,
            total_time: 0.0,
            avg_time: 0.0,
            max_time: 0.0,
            min_time: 0.0,
            ratio: 0.0
        },
        {
            name: 'unsqueeze2 trace_op',
            calls: 7,
            total_time: 0.0,
            avg_time: 0.0,
            max_time: 0.0,
            min_time: 0.0,
            ratio: 0.0
        },
        {
            name: 'reshape2 trace_op',
            calls: 229,
            total_time: 0.0,
            avg_time: 0.0,
            max_time: 0.0,
            min_time: 0.0,
            ratio: 0.0
        }
    ]
};
