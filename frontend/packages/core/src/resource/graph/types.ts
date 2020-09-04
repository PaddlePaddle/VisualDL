export type Property = {
    name?: string;
    value: string;
    type?: 'raw' | 'code';
    documentation?: boolean;
};

export type Argument = {
    name?: string;
    value: string;
    children?: Property[];
};

export type NameValues<T> = {
    name: string;
    values: T[];
};

export type NameValueGroup<T> = {
    name: string;
    properties: NameValues<T>[];
};

export type Properties = {
    properties?: NameValues<Property>[];
    groups?: NameValueGroup<Argument>[];
    metadata?: unknown;
};

export type SearchItem = {
    type: 'input' | 'output' | 'node' | 'initializer';
    name: string;
    id: string;
};

export type OpenedResult = {
    graphs: string[];
    selected: string | null;
};

export type SearchResult = {
    text: string;
    result: SearchItem[];
};

type IO = {
    name: string;
    type: string;
    option: string;
    description: string;
};

export type Documentation = {
    name: string;
    summary?: string;
    description?: string;
    attributes?: {
        name: string;
        type: string;
        description: string;
    }[];
    inputs?: IO[];
    inputs_range?: string;
    outputs?: IO[];
    outputs_range?: string;
    type_constraints?: {
        type_param_str: string;
        allowed_type_strs: string[];
        description: string;
    }[];
    examples?: {
        code: string;
        summary: string;
    }[];
    references?: {
        description: string;
    }[];
    domain?: string;
    since_version?: string;
    support_level?: string;
};
