export interface operatorPie {
    column_name: string[];
    cpu: Cpu[];
    gpu: Cpu[];
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
export interface tableType {
    events: Event[];
    column_name: string[];
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
    input_shape?: string[];
    children?: Child[];
}

export interface Child {
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
export interface pie_expand {
    order: string[];
    phase_type: string[];
    data: number[][];
}
