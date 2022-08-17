export interface tensorcorePie {
    column_name: string[];
    events: Event[];
}

export interface Event {
    name: string;
    calls: number;
    ratio: number;
}
export interface kernelPie {
    column_name: string[];
    events: kernelEvent[];
}

export interface kernelEvent {
    name: string;
    calls: number;
    total_time: number;
    avg_time: number;
    max_time: number;
    min_time: number;
    'mean blocks per sm': number;
    'mean est achieved occupancy': number;
    'tensor core used': boolean;
    ratio: number;
}
export interface tableDataType {
    events: tableEvent[];
    column_name: string[];
}

export interface tableEvent {
    name: string;
    calls: number;
    total_time: number;
    avg_time: number;
    max_time: number;
    min_time: number;
    'mean blocks per sm': number;
    'mean est achieved occupancy': number;
    'tensor core used': boolean;
    ratio: number;
    operator?:string;
    grid?:string;
}

