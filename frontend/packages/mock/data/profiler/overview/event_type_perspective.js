export default {
    order: ['Kernel', 'Memcpy', 'Memset'],
    Kernel: {
        calling_times: {
            key: ['Dataloader', 'Forward', 'Backward', 'Optimization', 'Other'],
            value: [64, 147, 250, 153, 94]
        },
        durations: {
            key: ['Dataloader', 'Forward', 'Backward', 'Optimization', 'Other'],
            value: [0.11, 2.5, 5.09, 0.45, 0.23]
        },
        ratios: {
            key: ['Dataloader', 'Forward', 'Backward', 'Optimization', 'Other'],
            value: [0.65, 14.9, 30.34, 2.7, 1.4]
        }
    },
    Memcpy: {
        calling_times: {key: ['Dataloader', 'Backward', 'Other'], value: [1, 7, 19]},
        durations: {key: ['Dataloader', 'Backward', 'Other'], value: [0.0, 0.01, 0.02]},
        ratios: {key: ['Dataloader', 'Backward', 'Other'], value: [1.43, 15.0, 33.57]}
    },
    Memset: {
        calling_times: {key: ['Backward'], value: [7]},
        durations: {key: ['Backward'], value: [0.01]},
        ratios: {key: ['Backward'], value: [50.0]}
    }
};
