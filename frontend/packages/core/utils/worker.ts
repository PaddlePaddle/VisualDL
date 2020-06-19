export default <P = unknown, R = unknown>(handler: (data: P) => R): void =>
    self.addEventListener('message', ({data}: MessageEvent & {data: P}) => {
        self.postMessage(handler(data));
    });
