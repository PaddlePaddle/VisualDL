export interface Model {
    readonly format: string;
    readonly producer: string;
    readonly description: string | null;
    readonly graphs: any;
}
