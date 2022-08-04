export default {
    column_name: ['name', 'calls', 'total_time', 'avg_time', 'max_time', 'min_time', 'ratio'],
    cpu: [
        {
            name: 'ProfileStep',
            calls: 7,
            total_time: '185.38',
            avg_time: '26.48',
            max_time: '30.25',
            min_time: '24.03',
            ratio: '100.00'
        },
        {
            name: 'Dataloader',
            calls: 7,
            total_time: '103.84',
            avg_time: '14.83',
            max_time: '15.94',
            min_time: '13.46',
            ratio: '56.01'
        },
        {
            name: 'Forward',
            calls: 7,
            total_time: '27.92',
            avg_time: '3.99',
            max_time: '5.39',
            min_time: '3.61',
            ratio: '15.06'
        },
        {
            name: 'Backward',
            calls: 7,
            total_time: '11.06',
            avg_time: '1.58',
            max_time: '2.25',
            min_time: '1.40',
            ratio: '5.97'
        },
        {
            name: 'Optimization',
            calls: 7,
            total_time: '19.22',
            avg_time: '2.75',
            max_time: '5.88',
            min_time: '2.15',
            ratio: '10.37'
        },
        {
            name: 'Other',
            calls: 7,
            total_time: '23.34',
            avg_time: '3.33',
            max_time: '4.26',
            min_time: '3.03',
            ratio: '12.59'
        }
    ]
    // gpu: [
    //     {
    //         name: 'ProfileStep',
    //         calls: 7,
    //         total_time: '31.21',
    //         avg_time: '4.46',
    //         max_time: '2.75',
    //         min_time: '0.00',
    //         ratio: '100.00'
    //     },
    //     {
    //         name: 'Dataloader',
    //         calls: 7,
    //         total_time: '0.11',
    //         avg_time: '0.02',
    //         max_time: '0.11',
    //         min_time: '0.00',
    //         ratio: '0.35'
    //     },
    //     {
    //         name: 'Forward',
    //         calls: 7,
    //         total_time: '4.65',
    //         avg_time: '0.66',
    //         max_time: '0.38',
    //         min_time: '0.00',
    //         ratio: '14.89'
    //     },
    //     {
    //         name: 'Backward',
    //         calls: 7,
    //         total_time: '9.45',
    //         avg_time: '1.35',
    //         max_time: '0.74',
    //         min_time: '0.00',
    //         ratio: '30.29'
    //     },
    //     {
    //         name: 'Optimization',
    //         calls: 7,
    //         total_time: '0.85',
    //         avg_time: '0.12',
    //         max_time: '0.10',
    //         min_time: '0.00',
    //         ratio: '2.72'
    //     },
    //     {
    //         name: 'Other',
    //         calls: 7,
    //         total_time: '0.44',
    //         avg_time: '0.06',
    //         max_time: '0.05',
    //         min_time: '0.00',
    //         ratio: '1.40'
    //     }
    // ]
};
