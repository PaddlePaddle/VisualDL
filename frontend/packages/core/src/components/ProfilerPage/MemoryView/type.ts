export interface devicesType {
    device: string;
    min_size: number;
    max_size: number;
    max_allocation_size: string;
}
export interface curveType {
    name: Name;
    Allocated: (number | string)[][];
    Reserved: (number | string)[][];
    PeakAllocated: (number | string)[][];
    PeakReserved: (number | string)[][];
}

export interface Name {
    Allocated: string;
    Reserved: string;
    PeakAllocated: string;
    PeakReserved: string;
}
export interface memory_events_type {
    column_name: string[];
    data: Datum[];
}
export interface Datum {
    MemoryType: string;
    AllocatedEvent: string;
    AllocatedTimestamp: number;
    Duration: number;
    Size: number;
    FreeEvent: string;
    FreeTimestamp: number;
}
export interface op_memory_events_type {
    column_name: string[];
    data: op_datum[];
}

export interface op_datum {
    EventName: string;
    MemoryType: string;
    AllocationCount: number;
    FreeCount: number;
    AllocationSize: number;
    FreeSize: number;
    IncreasedSize: number;
}
