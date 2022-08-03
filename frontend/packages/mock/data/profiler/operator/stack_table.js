export default {
    column_name: ['total_time', 'max_time', 'min_time', 'avg_time', 'ratio'],
    data: [
        {
            name: 'op1',
            key: 'op1',
            call: '5000',
            cpu_total_time: 5322,
            cpu_max_time: 40,
            cpu_min_time: 20,
            cpu_avg_time: 30,
            cpu_ratio: 30,
            gpu_total_time: 5322,
            gpu_max_time: 40,
            gpu_min_time: 20,
            gpu_avg_time: 30,
            gpu_ratio: 30,
            expends: [
                {name: 'infer_shape', total_time: 5322, max_time: 40, min_time: 20, avg_time: 30, ratio: 30},
                {name: 'compute', total_time: 5322, max_time: 40, min_time: 20, avg_time: 30, ratio: 30},
                {name: 'grad_node_creation', total_time: 5322, max_time: 40, min_time: 20, avg_time: 30, ratio: 30}
            ]
        }
    ]
};
