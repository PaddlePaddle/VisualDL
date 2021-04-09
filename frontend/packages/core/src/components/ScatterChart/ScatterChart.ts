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

// cSpell:words persp roboto

import * as THREE from 'three';
import * as d3 from 'd3';

import type {ColorMap, Point2D, Point3D} from './types';

import {ColorType} from './types';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

export type ScatterChartOptions = {
    width: number;
    height: number;
    is3D?: boolean;
    background?: string | number | THREE.Color;
};

export default abstract class ScatterChart {
    static readonly CUBE_LENGTH = 2;
    static readonly MAX_ZOOM = 5 * ScatterChart.CUBE_LENGTH;
    static readonly MIN_ZOOM = 0.025 * ScatterChart.CUBE_LENGTH;
    static readonly PERSP_CAMERA_FOV_VERTICAL = 70;
    static readonly PERSP_CAMERA_NEAR_CLIP_PLANE = 0.01;
    static readonly PERSP_CAMERA_FAR_CLIP_PLANE = 100;
    static readonly ORTHO_CAMERA_FRUSTUM_HALF_EXTENT = 1.2;
    static readonly ORBIT_MOUSE_ROTATION_SPEED = 1;
    static readonly ORBIT_ANIMATION_ROTATION_CYCLE_IN_SECONDS = 2;

    static readonly PERSP_CAMERA_INIT_POSITION: Point3D = [0.45, 0.9, 1.6];
    static readonly ORTHO_CAMERA_INIT_POSITION: Point3D = [0, 0, 4];

    static readonly VALUE_COLOR_MAP_RANGE = ['#ffffdd', '#1f2d86'] as const;
    static readonly CATEGORY_COLOR_MAP = [
        '#9BB9E8',
        '#8BB8FF',
        '#B4CCB7',
        '#A8E9B8',
        '#DB989A',
        '#6DCDE4',
        '#93C2CA',
        '#DE7CCE',
        '#DA96BC',
        '#309E51',
        '#D6C482',
        '#6D7CE4',
        '#CDCB74',
        '#2576AD',
        '#E46D6D',
        '#CA5353',
        '#E49D6D',
        '#E4E06D'
    ].map(color => new THREE.Color(color));

    width: number;
    height: number;
    background: string | number | THREE.Color = '#fff';
    is3D = true;
    data: Point3D[] = [];
    labels: string[] = [];

    protected abstract readonly vertexShader: string;
    protected abstract readonly fragmentShader: string;

    // canvas container
    protected readonly container: HTMLElement;

    protected canvas: HTMLCanvasElement | null;
    protected scene: THREE.Scene;
    protected renderer: THREE.WebGLRenderer;
    protected camera: THREE.OrthographicCamera | THREE.PerspectiveCamera;
    protected controls: OrbitControls;
    private axes: THREE.AxesHelper | null = null;

    protected geometry: THREE.BufferGeometry;
    protected material: THREE.ShaderMaterial | null = null;
    protected positions: Float32Array = new Float32Array();
    protected colors: Float32Array = new Float32Array();

    // render target which picking colors will render to
    protected pickingRenderTarget: THREE.WebGLRenderTarget;
    protected pickingMaterial: THREE.ShaderMaterial | null = null;
    protected pickingColors: Float32Array | null = null;

    protected fog: THREE.Fog | null = null;
    protected blending: THREE.Blending = THREE.NormalBlending;
    protected depth = true;

    protected colorMap: ColorMap = {type: ColorType.Null, labels: []};
    protected colorGenerator: ((value: string) => THREE.Color) | null = null;

    private mouseCoordinates: Point2D | null = null;
    private onMouseMoveBindThis: (e: MouseEvent) => void;

    protected focusedDataIndices: number[] = [];
    protected hoveredDataIndices: number[] = [];
    protected highLightDataIndices: number[] = [];

    private rotate = false;
    private animationId: number | null = null;

    protected abstract get object(): (THREE.Object3D & {material: THREE.Material | THREE.Material[]}) | null;
    protected abstract get defaultColor(): THREE.Color;
    protected abstract get hoveredColor(): THREE.Color;
    protected abstract get focusedColor(): THREE.Color;
    protected abstract get highLightColor(): THREE.Color;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected abstract createShaderUniforms(picking: boolean): Record<string, THREE.IUniform<any>>;
    protected abstract onRender(): void;
    protected abstract onSetSize(width: number, height: number): void;
    protected abstract onDataSet(): void;
    protected abstract onDispose(): void;

    get dataCount() {
        return this.data.length;
    }

    constructor(container: HTMLElement, options: ScatterChartOptions) {
        this.container = container;
        this.width = options.width;
        this.height = options.height;
        this.is3D = options.is3D ?? this.is3D;
        this.background = options.background ?? this.background;

        this.canvas = this.initCanvas();
        this.container.appendChild(this.canvas);

        this.scene = this.initScene();
        this.camera = this.initCamera();
        this.renderer = this.initRenderer();
        this.controls = this.initControls();
        this.pickingRenderTarget = this.initRenderTarget();
        this.geometry = this.createGeometry();

        this.onMouseMoveBindThis = this.onMouseMove.bind(this);

        this.bindEventListeners();

        if (this.is3D) {
            this.addAxes();
        }

        this.reset();
    }

    private initCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        return canvas;
    }

    private initScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(this.background);
        const light = new THREE.PointLight(16772287, 1, 0);
        light.name = 'light';
        scene.add(light);
        return scene;
    }

    private initCamera() {
        const origin = new THREE.Vector3(0, 0, 0);
        let camera: THREE.OrthographicCamera | THREE.PerspectiveCamera;
        if (this.is3D) {
            camera = new THREE.PerspectiveCamera(
                ScatterChart.PERSP_CAMERA_FOV_VERTICAL,
                this.width / this.height,
                ScatterChart.PERSP_CAMERA_NEAR_CLIP_PLANE,
                ScatterChart.PERSP_CAMERA_FAR_CLIP_PLANE
            );
            camera.position.set(...ScatterChart.PERSP_CAMERA_INIT_POSITION);
        } else {
            camera = new THREE.OrthographicCamera(
                -ScatterChart.ORTHO_CAMERA_FRUSTUM_HALF_EXTENT,
                ScatterChart.ORTHO_CAMERA_FRUSTUM_HALF_EXTENT,
                ScatterChart.ORTHO_CAMERA_FRUSTUM_HALF_EXTENT,
                -ScatterChart.ORTHO_CAMERA_FRUSTUM_HALF_EXTENT,
                -1000,
                1000
            );
            camera.position.set(...ScatterChart.ORTHO_CAMERA_INIT_POSITION);
            camera.up = new THREE.Vector3(0, 1, 0);
        }
        camera.lookAt(origin);
        camera.zoom = 1;
        camera.updateProjectionMatrix();
        return camera;
    }

    private initRenderer() {
        const renderer = new THREE.WebGLRenderer({
            canvas: this.canvas ?? undefined,
            alpha: true,
            premultipliedAlpha: false,
            antialias: false
        });
        renderer.setClearColor(this.background, 1);
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        renderer.setSize(this.width, this.height);
        return renderer;
    }

    private initControls() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enableRotate = this.is3D;
        controls.autoRotate = false;
        controls.rotateSpeed = ScatterChart.ORBIT_MOUSE_ROTATION_SPEED;
        controls.minDistance = ScatterChart.MIN_ZOOM;
        controls.maxDistance = ScatterChart.MAX_ZOOM;
        controls.mouseButtons.LEFT = this.is3D ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN;
        controls.reset();

        controls.addEventListener('start', () => {
            this.stopRotate();
        });
        controls.addEventListener('change', () => {
            this.render();
        });
        return controls;
    }

    private initRenderTarget() {
        const renderCanvasSize = new THREE.Vector2();
        this.renderer.getSize(renderCanvasSize);
        const pixelRadio = this.renderer.getPixelRatio();
        const renderTarget = new THREE.WebGLRenderTarget(
            renderCanvasSize.width * pixelRadio,
            renderCanvasSize.height * pixelRadio
        );
        renderTarget.texture.minFilter = THREE.LinearFilter;
        return renderTarget;
    }

    private createGeometry() {
        const geometry = new THREE.BufferGeometry();
        geometry.computeBoundingSphere();
        return geometry;
    }

    private createRenderMaterial() {
        const uniforms = this.createShaderUniforms(false);
        return new THREE.ShaderMaterial({
            transparent: true,
            depthTest: this.depth,
            depthWrite: this.depth,
            fog: this.fog != null,
            blending: this.blending,
            uniforms,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader
        });
    }

    private createPickingMaterial() {
        const uniforms = this.createShaderUniforms(true);
        return new THREE.ShaderMaterial({
            transparent: true,
            depthTest: true,
            depthWrite: true,
            fog: false,
            blending: THREE.NormalBlending,
            uniforms,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader
        });
    }

    private convertColorMap() {
        switch (this.colorMap.type) {
            case ColorType.Value: {
                const {minValue, maxValue} = this.colorMap;
                return (label: string) => {
                    const value = Number.parseFloat(label);
                    if (!Number.isFinite(value)) {
                        return this.defaultColor;
                    }
                    const ranger = d3
                        .scaleLinear<string, string>()
                        .domain([minValue, maxValue])
                        .range(ScatterChart.VALUE_COLOR_MAP_RANGE);
                    return new THREE.Color(ranger(value));
                };
            }
            case ColorType.Category: {
                const categories = this.colorMap.categories;
                return (label: string) => {
                    const index = categories.indexOf(label);
                    if (index === -1) {
                        return this.defaultColor;
                    }
                    return ScatterChart.CATEGORY_COLOR_MAP[index % ScatterChart.CATEGORY_COLOR_MAP.length];
                };
            }
            default:
                return null;
        }
    }

    protected getColorByIndex(index: number): THREE.Color {
        if (this.hoveredDataIndices.includes(index)) {
            return this.hoveredColor;
        }
        if (this.focusedDataIndices.includes(index)) {
            return this.focusedColor;
        }
        if (this.highLightDataIndices.includes(index)) {
            return this.highLightColor;
        }
        if (this.colorGenerator) {
            return this.colorGenerator(this.colorMap.labels[index]);
        }
        return this.defaultColor;
    }

    protected createMaterial() {
        this.material = this.createRenderMaterial();
        this.pickingMaterial = this.createPickingMaterial();
    }

    protected setGeometryAttribute(name: string, data: Float32Array, dim: number) {
        this.geometry.setAttribute(name, new THREE.BufferAttribute(data, dim));
    }

    protected setPosition(positions: Float32Array) {
        this.setGeometryAttribute('position', positions, 3);
    }

    protected setColor(colors: Float32Array) {
        this.setGeometryAttribute('color', colors, 3);
    }

    private convertDataToPosition() {
        const data = this.data;

        const xScaler = d3.scaleLinear();
        const yScaler = d3.scaleLinear();
        let zScaler: d3.ScaleLinear<number, number> | null = null;
        const xExtent = d3.extent(data, (_p, i) => data[i][0]) as [number, number];
        const yExtent = d3.extent(data, (_p, i) => data[i][1]) as [number, number];
        const range = [-ScatterChart.CUBE_LENGTH / 2, ScatterChart.CUBE_LENGTH / 2];
        xScaler.domain(xExtent).range(range);
        yScaler.domain(yExtent).range(range);
        if (this.is3D) {
            zScaler = d3.scaleLinear();
            const zExtent = d3.extent(data, (_p, i) => data[i][2]) as [number, number];
            zScaler.domain(zExtent).range(range);
        }

        const dataInRange = data.map(d => [xScaler(d[0]) ?? 0, yScaler(d[1]) ?? 0, zScaler?.(d[2]) ?? 0] as Point3D);

        const positions = new Float32Array(dataInRange.length * 3);
        let dst = 0;
        dataInRange.forEach(d => {
            positions[dst++] = d[0];
            positions[dst++] = d[1];
            positions[dst++] = d[2];
        });
        return positions;
    }

    private convertDataPickingColor() {
        const count = this.dataCount;
        const colors = new Float32Array(count * 3);
        let dst = 0;
        for (let i = 0; i < count; i++) {
            const color = new THREE.Color(i);
            colors[dst++] = color.r;
            colors[dst++] = color.g;
            colors[dst++] = color.b;
        }
        return colors;
    }

    private updateHoveredPoints() {
        if (!this.mouseCoordinates) {
            return;
        }
        const dpr = window.devicePixelRatio || 1;
        const x = Math.floor(this.mouseCoordinates[0] * dpr);
        const y = Math.floor(this.mouseCoordinates[1] * dpr);
        const pointCount = this.dataCount;
        const width = Math.floor(dpr);
        const height = Math.floor(dpr);
        const pixelBuffer = new Uint8Array(width * height * 4);
        this.renderer.readRenderTargetPixels(
            this.pickingRenderTarget,
            x,
            this.pickingRenderTarget.height - y,
            width,
            height,
            pixelBuffer
        );
        const pointIndicesSelection = new Uint8Array(pointCount);
        const pixels = width * height;
        for (let i = 0; i < pixels; i++) {
            const id = (pixelBuffer[i * 4] << 16) | (pixelBuffer[i * 4 + 1] << 8) | pixelBuffer[i * 4 + 2];
            if (id !== 16777215 && id < pointCount) {
                pointIndicesSelection[id] = 1;
            }
        }
        const pointIndices: number[] = [];
        for (let i = 0; i < pointIndicesSelection.length; i++) {
            if (pointIndicesSelection[i] === 1) {
                pointIndices.push(i);
            }
        }
        this.hoveredDataIndices = pointIndices;
    }

    private updateLight() {
        const light = this.scene.getObjectByName('light') as THREE.PointLight;
        const cameraPos = this.camera.position;
        const lightPos = cameraPos.clone();
        lightPos.x += 1;
        lightPos.y += 1;
        light.position.set(lightPos.x, lightPos.y, lightPos.z);
    }

    private bindEventListeners() {
        this.canvas?.addEventListener('mousemove', this.onMouseMoveBindThis);
    }

    private removeEventListeners() {
        this.canvas?.removeEventListener('mousemove', this.onMouseMoveBindThis);
    }

    private onMouseMove(e: MouseEvent) {
        this.mouseCoordinates = [e.offsetX, e.offsetY];
        this.render();
    }

    private addAxes() {
        if (this.axes) {
            this.removeAxes();
        }
        this.axes = new THREE.AxesHelper();
        this.scene.add(this.axes);
    }

    private removeAxes() {
        if (this.axes) {
            this.scene.remove(this.axes);
            this.axes = null;
        }
    }

    protected render() {
        this.updateLight();
        this.updateHoveredPoints();
        this.onRender();

        if (this.pickingMaterial) {
            if (this.axes) {
                this.scene.remove(this.axes);
            }
            if (this.object && this.pickingMaterial) {
                this.object.material = this.pickingMaterial;
            }
            if (this.pickingColors) {
                this.setColor(this.pickingColors);
            }
            this.renderer.setRenderTarget(this.pickingRenderTarget);
            this.renderer.render(this.scene, this.camera);
            if (this.axes) {
                this.scene.add(this.axes);
            }
            if (this.object && this.material) {
                this.object.material = this.material;
            }
        }
        if (this.colors.length) {
            this.setColor(this.colors);
        }
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.camera);
    }

    startRotate() {
        if (this.rotate) {
            return;
        }
        this.rotate = true;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = ScatterChart.ORBIT_ANIMATION_ROTATION_CYCLE_IN_SECONDS;
        const rotate = () => {
            this.controls.update();
            this.animationId = requestAnimationFrame(rotate);
        };
        rotate();
    }

    stopRotate() {
        if (this.rotate) {
            this.rotate = false;
            this.controls.autoRotate = false;
            this.controls.rotateSpeed = ScatterChart.ORBIT_MOUSE_ROTATION_SPEED;
            if (this.animationId != null) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }
    }

    reset() {
        this.controls.reset();
        if (this.is3D && !this.animationId) {
            this.startRotate();
        }
    }

    setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.onSetSize(width, height);
        if (this.is3D) {
            const camera = this.camera as THREE.PerspectiveCamera;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
        this.renderer.setSize(width, height);
        this.pickingRenderTarget = this.initRenderTarget();
        this.controls.update();
    }

    setDimension(is3D: boolean) {
        if (this.is3D === is3D) {
            return;
        }
        this.is3D = is3D;
        this.stopRotate();
        this.controls.dispose();
        this.camera = this.initCamera();
        this.controls = this.initControls();
        if (is3D) {
            this.addAxes();
            this.startRotate();
        } else {
            this.removeAxes();
        }
        this.setData(this.data, this.labels, this.colorMap);
    }

    setData(data: Point3D[], labels: string[], colorMap?: ColorMap | null) {
        if (this.object) {
            this.scene.remove(this.object);
        }
        this.labels = labels;
        this.colorMap = colorMap ?? {type: ColorType.Null, labels: []};
        this.data = data;
        this.colorGenerator = this.convertColorMap();
        this.positions = this.convertDataToPosition();
        this.pickingColors = this.convertDataPickingColor();
        this.onDataSet();
        if (this.object) {
            this.scene.add(this.object);
        }
        this.render();
    }

    setHighLightIndices(highLightIndices: number[]) {
        this.highLightDataIndices = highLightIndices;
        this.render();
    }

    setFocusedPointIndices(focusedPointIndices: number[]) {
        this.focusedDataIndices = focusedPointIndices;
        this.render();
    }

    dispose() {
        this.removeEventListeners();
        this.onDispose();
        if (this.canvas) {
            this.container.removeChild(this.canvas);
            this.canvas = null;
        }
        this.renderer.dispose();
        this.controls.dispose();
        this.pickingRenderTarget.dispose();
        this.geometry.dispose();
        this.material?.dispose();
        this.pickingMaterial?.dispose();
    }
}
