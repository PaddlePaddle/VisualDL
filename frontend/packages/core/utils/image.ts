export function downloadFromBase64(filename: string, base64: string): void {
    if (!process.browser) {
        return;
    }

    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;

    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    const blob = new Blob([uInt8Array], {type: contentType});

    const e = document.createEvent('HTMLEvents');
    e.initEvent('click', true, true);

    const a = document.createElement('a');
    a.download = filename;
    a.href = URL.createObjectURL(blob);
    a.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
    URL.revokeObjectURL(a.href);
}
