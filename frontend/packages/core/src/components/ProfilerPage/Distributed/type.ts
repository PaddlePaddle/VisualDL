export interface infoType {
    worker_name: string;
    process_id: string;
    device_id: string;
    name: string;
    memory: string;
    computeCapability: string;
    utilization: string;
}
export interface histogramType {
    order: string[];
    worker_name: string[];
    data: number[][];
}
