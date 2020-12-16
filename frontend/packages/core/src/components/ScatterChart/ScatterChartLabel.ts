/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// cSpell:words roboto

type ScatterChartLabelOptions = {
    width: number;
    height: number;
};

type LabelRenderContext = {
    text: string;
    fontSize: number;
    fillColor: string;
    strokeColor: string;
    opacity: number;
    x: number;
    y: number;
};

function convertToRGBA(color: string, opacity: number) {
    if (color.startsWith('rgb')) {
        const rgba = color.replace(/^rgba?\(|\)$/g, '');
        const [r, g, b, a = '1'] = rgba.split(',').map(c => c.trim());

        return `rgba(${r}, ${g}, ${b}, ${Number.parseFloat(a.trim()) * opacity})`;
    }
    let hex = color.replace('#', '');

    if (hex.length === 3) {
        hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default class ScatterChartLabel {
    private readonly container: HTMLElement;
    private canvas: HTMLCanvasElement | null;

    width: number;
    height: number;

    constructor(container: HTMLElement, options: ScatterChartLabelOptions) {
        this.container = container;
        this.width = options.width;
        this.height = options.height;

        this.canvas = this.initCanvas();
        this.container.appendChild(this.canvas);
    }

    private initCanvas() {
        const canvas = document.createElement('canvas');
        const dpr = window.devicePixelRatio || 1;
        canvas.width = this.width * dpr;
        canvas.height = this.height * dpr;
        canvas.style.width = `${this.width}px`;
        canvas.style.height = `${this.height}px`;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none';
        return canvas;
    }

    render(labels: LabelRenderContext[]) {
        this.clear();
        const ctx = this.canvas?.getContext('2d');
        if (ctx) {
            ctx.miterLimit = 2;
            ctx.textBaseline = 'middle';
            labels.forEach(label => {
                if (!label.text) {
                    return;
                }
                ctx.fillStyle = convertToRGBA(label.fillColor, label.opacity);
                ctx.strokeStyle = convertToRGBA(label.strokeColor, label.opacity);
                ctx.font = `${label.fontSize}px roboto`;
                ctx.lineWidth = 3;
                ctx.strokeText(label.text, label.x, label.y);
                ctx.lineWidth = 6;
                ctx.fillText(label.text, label.x, label.y);
            });
        }
    }

    clear() {
        const ctx = this.canvas?.getContext('2d');
        if (ctx) {
            const dpr = window.devicePixelRatio || 1;
            ctx.clearRect(0, 0, this.width * dpr, this.height * dpr);
        }
    }

    setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
        if (this.canvas) {
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = this.width * dpr;
            this.canvas.height = this.height * dpr;
            this.canvas.style.width = `${this.width}px`;
            this.canvas.style.height = `${this.height}px`;
        }
    }

    dispose() {
        if (this.canvas) {
            this.container.removeChild(this.canvas);
            this.canvas = null;
        }
    }
}
