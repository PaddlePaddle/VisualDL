export default {
    number_workers: 5,
    device_type: 'GPU',
    CPU: {
        process_utilization: 78,
        system_utilization: 30
    },
    GPU: {
        name: 'Tesla P40',
        memory: '22.3 GB',
        compute_capability: '6.1',
        utilization: 50,
        sm_efficiency: 57,
        achieved_occupancy: 33,
        tensor_core_percentage: 55
    }
};
