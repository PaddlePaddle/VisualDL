export type GetThis<T> = T extends (this: infer U, ...args: any[]) => any ? U : never;
