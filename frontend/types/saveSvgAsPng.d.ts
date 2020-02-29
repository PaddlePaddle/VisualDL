declare module 'save-svg-as-png' {
    export function saveSvgAsPng(node: Node, filename: string): Promise<void>;
}
