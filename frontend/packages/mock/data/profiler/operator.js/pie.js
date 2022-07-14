export default {
    column_name: ['total_time', 'max_time', 'min_time', 'avg_time', 'ratio'],
    cpu: [
        {
            name: 'op1',
            total_time: 5322,
            max_time: 40,
            min_time: 20,
            avg_time: 30,
            ratio: 30,
            children: [
                {name: 'infer_shape', total_time: 5322, max_time: 40, min_time: 20, avg_time: 30, ratio: 30},
                {name: 'compute', total_time: 5322, max_time: 40, min_time: 20, avg_time: 30, ratio: 30},
                {name: 'grad_node_creation', total_time: 5322, max_time: 40, min_time: 20, avg_time: 30, ratio: 30}
            ]
        },
        {name: 'op2', total_time: 5322, max_time: 40, min_time: 20, avg_time: 30, ratio: 30},
        {name: 'op3', total_time: 5322, max_time: 40, min_time: 20, avg_time: 30, ratio: 30},
        {name: 'op4', total_time: 5322, max_time: 40, min_time: 20, avg_time: 30, ratio: 30},
        {name: 'op5', total_time: 5322, max_time: 40, min_time: 20, avg_time: 30, ratio: 30},
        {name: 'op6', total_time: 5322, max_time: 40, min_time: 20, avg_time: 30, ratio: 30},
        {name: 'op7', total_time: 5322, max_time: 40, min_time: 20, avg_time: 30, ratio: 30},
        {name: 'op8', total_time: 5322, max_time: 40, min_time: 20, avg_time: 30, ratio: 30},
        {name: 'op9', total_time: 5322, max_time: 40, min_time: 20, avg_time: 30, ratio: 30}
    ],
    gpu: [
        {name: 'op1', total_time: 5322, max_time: 40, min_time: 20, avg_time: 30, ratio: 30},
        {name: 'op2', total_time: 5322, max_time: 40, min_time: 20, avg_time: 30, ratio: 30},
        {name: 'op3', total_time: 5322, max_time: 40, min_time: 20, avg_time: 30, ratio: 30},
        {name: 'op4', total_time: 5322, max_time: 40, min_time: 20, avg_time: 30, ratio: 30},
        {name: 'op5', total_time: 5322, max_time: 40, min_time: 20, avg_time: 30, ratio: 30}
    ]
};
