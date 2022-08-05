export interface environmentType {
    device_type: string;
    CPU: CPU;
    GPU: GPU;
    num_workers: number;
}

interface GPU {
    name: string;
    memory: number;
    compute_capability: string;
    utilization: string;
    sm_efficiency: string;
    achieved_occupancy: string;
    tensor_core_percentage: string;
}

interface CPU {
    process_utilization: string;
    system_utilization: string;
}

export interface consumingType {
    column_name: string[];
    cpu: Cpu[];
    gpu: Cpu[];
}
export interface stringObj {
    GPUname: string;
    GPUcalls: number;
    GPUtotal_time: string;
    GPUavg_time: string;
    GPUmax_time: string;
    GPUmin_time: string;
    GPUratio: string;
}
export interface tableType {
    name: string;
    calls: number;
    total_time: number;
    max_time: number;
    min_time: number;
    avg_time: number;
    ratio: number;
    GPUtotal_time: number;
    GPUmax_time: number;
    GPUmin_time: number;
    GPUavg_time: number;
    GPUratio: number;
}
export interface Cpu {
    name: string;
    calls: number;
    total_time: number;
    avg_time: number;
    max_time: number;
    min_time: number;
    ratio: number;
}
export interface Gpu {
    GPUtotal_time: number;
    GPUmax_time: number;
    GPUmin_time: number;
    GPUavg_time: number;
    GPUratio: number;
}

export interface trainType {
    order: string[];
    steps: number[];
    data: number[][];
}

export interface perspectiveType {
    column_name: string[];
    events: Event[];
}

export interface Event {
    name: string;
    calls: number;
    cpu_total_time: number;
    cpu_avg_time: number;
    cpu_max_time: number;
    cpu_min_time: number;
    cpu_ratio: number;
    gpu_total_time: number;
    gpu_avg_time: number;
    gpu_max_time: number;
    gpu_min_time: number;
    gpu_ratio: number;
}

export interface performanceType {
    order: string[];
    Kernel: Kernel;
    Memcpy: Kernel;
    Memset: Kernel;
}

export interface Kernel {
    calling_times: Callingtimes;
    durations: Callingtimes;
    ratios: Callingtimes;
}

export interface Callingtimes {
    key: string[];
    value: number[];
}
export interface distributedData {
    order: string[];
    phase_type: string[];
    data: number[][];
}
export interface DataType {
    name: string;
    calls: number;
    total_time: number;
    max_time: number;
    min_time: number;
    avg_time: number;
    ratio: number;
    GPUtotal_time: number;
    GPUmax_time: number;
    GPUmin_time: number;
    GPUavg_time: number;
    GPUratio: number;
}
export interface DataType2 {
    name: string;
    calls: number;
    cpu_total_time: number;
    cpu_avg_time: number;
    cpu_max_time: number;
    cpu_min_time: number;
    cpu_ratio: number;
    gpu_total_time: number;
    gpu_avg_time: number;
    gpu_max_time: number;
    gpu_min_time: number;
    gpu_ratio: number;
}
