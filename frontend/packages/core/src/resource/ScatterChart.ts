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

// cSpell:words persp coord

import * as THREE from 'three';
import * as d3 from 'd3';

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

export type ScatterChartOptions = {
    width: number;
    height: number;
    is3D?: boolean;
    background?: string | number | THREE.Color;
};

export default class ScatterChart {
    static CUBE_LENGTH = 2;
    static MAX_ZOOM = 5 * ScatterChart.CUBE_LENGTH;
    static MIN_ZOOM = 0.025 * ScatterChart.CUBE_LENGTH;
    static PERSP_CAMERA_FOV_VERTICAL = 70;
    static PERSP_CAMERA_NEAR_CLIP_PLANE = 0.01;
    static PERSP_CAMERA_FAR_CLIP_PLANE = 100;
    static ORTHO_CAMERA_FRUSTUM_HALF_EXTENT = 1.2;
    static ORBIT_MOUSE_ROTATION_SPEED = 1;
    static ORBIT_ANIMATION_ROTATION_CYCLE_IN_SECONDS = 2;
    static NUM_POINTS_FOG_THRESHOLD = 5000;
    static MIN_POINT_SIZE = 5;

    static POINT_COLOR_NO_SELECTION = 0x7575d9;

    static PERSP_CAMERA_INIT_POSITION = [0.45, 0.9, 1.6] as const;
    static ORTHO_CAMERA_INIT_POSITION = [0, 0, 4] as const;

    width: number;
    height: number;
    background: string | number | THREE.Color = '#fff';
    is3D = true;
    data: [number, number, number][] = [];
    private readonly canvas: HTMLCanvasElement;
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private camera: THREE.OrthographicCamera | THREE.PerspectiveCamera;
    private controls: OrbitControls;
    private axes: THREE.AxesHelper | null = null;
    private points: THREE.Points | null = null;

    private rotate = false;
    private animationId: number | null = null;

    constructor(canvas: HTMLCanvasElement, options: ScatterChartOptions) {
        this.canvas = canvas;
        this.width = options.width;
        this.height = options.height;
        this.is3D = options.is3D ?? this.is3D;
        this.background = options.background ?? this.background;

        this.scene = this.initScene();
        this.camera = this.initCamera();
        this.renderer = this.initRenderer();
        this.controls = this.initControls();

        if (this.is3D) {
            this.addAxes();
        }

        this.reset();
    }

    private initScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(this.background);
        const light = new THREE.PointLight(16772287, 1, 0);
        light.name = 'light';
        scene.add(light);
        scene.fog = new THREE.Fog(0xffffff);
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
            canvas: this.canvas,
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

    private render() {
        const light = this.scene.getObjectByName('light') as THREE.PointLight;
        const cameraPos = this.camera.position;
        const lightPos = cameraPos.clone();
        lightPos.x += 1;
        lightPos.y += 1;
        light.position.set(lightPos.x, lightPos.y, lightPos.z);

        if (this.points) {
            const material = this.points.material as THREE.ShaderMaterial;
            material.uniforms.color.value = new THREE.Color(ScatterChart.POINT_COLOR_NO_SELECTION);
        }

        // TODO: remake fog
        // const fog = this.scene.fog as THREE.Fog | null;
        // if (fog) {
        //     if (this.is3D) {
        //         const cameraTarget = this.controls.target ?? new THREE.Vector3();
        //         let shortestDist = Number.POSITIVE_INFINITY;
        //         let furthestDist = 0;
        //         const camToTarget = new THREE.Vector3().copy(cameraTarget).sub(cameraPos);
        //         const camPlaneNormal = new THREE.Vector3().copy(camToTarget).normalize();

        //         const camToPoint = new THREE.Vector3();
        //         this.data.forEach(d => {
        //             camToPoint.copy(new THREE.Vector3(...d)).sub(cameraPos);
        //             const dist = camPlaneNormal.dot(camToPoint);
        //             if (dist < 0) {
        //                 return;
        //             }
        //             furthestDist = dist > furthestDist ? dist : furthestDist;
        //             shortestDist = dist < shortestDist ? dist : shortestDist;
        //         });
        //         const multiplier =
        //             2 -
        //             Math.min(this.data.length, ScatterChart.NUM_POINTS_FOG_THRESHOLD) /
        //                 ScatterChart.NUM_POINTS_FOG_THRESHOLD;
        //         fog.near = shortestDist;
        //         fog.far = furthestDist * multiplier;
        //     } else {
        //         fog.near = Number.POSITIVE_INFINITY;
        //         fog.far = Number.POSITIVE_INFINITY;
        //     }
        //     console.log(fog.near, fog.far, fog.color);
        //     if (this.points) {
        //         const material = this.points.material as THREE.ShaderMaterial;
        //         material.uniforms.fogColor.value = fog.color;
        //         material.uniforms.fogNear.value = fog.near;
        //         material.uniforms.fogFar.value = fog.far;
        //     }
        // }

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
        if (this.is3D) {
            const camera = this.camera as THREE.PerspectiveCamera;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
        this.controls.update();
        this.renderer.setSize(width, height);
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
        this.setData(this.data);
    }

    setData(data: [number, number, number][]) {
        this.data = data;

        if (this.points) {
            this.scene.remove(this.points);
        }

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

        const dataInRange = data.map(d => [xScaler(d[0]) ?? 0, yScaler(d[1]) ?? 0, zScaler?.(d[2]) ?? 0]);

        const positions = new Float32Array(data.length * 3);
        let dst = 0;
        dataInRange.forEach(d => {
            positions[dst++] = d[0];
            positions[dst++] = d[1];
            positions[dst++] = d[2];
        });

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.computeBoundingSphere();

        const fog = this.scene.fog as THREE.Fog | null;
        const material = new THREE.ShaderMaterial({
            transparent: true,
            depthTest: false,
            depthWrite: false,
            fog: true,
            blending: THREE.MultiplyBlending,
            uniforms: {
                pointSize: {value: 200 / Math.log(data.length) / Math.log(8) / (this.is3D ? 1 : 1.5)},
                scale: {value: 1},
                color: {value: new THREE.Color()},
                opacity: {value: 1},
                sizeAttenuation: {value: this.is3D},
                fogColor: {value: fog?.color},
                fogNear: {value: fog?.near},
                fogFar: {value: fog?.far}
            },
            vertexShader: `
                uniform vec3 color;
                uniform bool sizeAttenuation;
                uniform float pointSize;

                varying vec3 vColor;

                ${THREE.ShaderChunk['fog_pars_vertex']}

                void main() {
                    vColor = color;

                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * mvPosition;

                    float outputPointSize = pointSize;
                    if (sizeAttenuation) {
                        outputPointSize = -pointSize / mvPosition.z;
                    } else {
                        const float PI = 3.1415926535897932384626433832795;
                        const float minScale = 0.1;  // minimum scaling factor
                        const float outSpeed = 2.0;  // shrink speed when zooming out
                        const float outNorm = (1. - minScale) / atan(outSpeed);
                        const float maxScale = 15.0;  // maximum scaling factor
                        const float inSpeed = 0.02;  // enlarge speed when zooming in
                        const float zoomOffset = 0.3;  // offset zoom pivot
                        float zoom = projectionMatrix[0][0] + zoomOffset;  // zoom pivot
                        float scale = zoom < 1. ? 1. + outNorm * atan(outSpeed * (zoom - 1.)) :
                                        1. + 2. / PI * (maxScale - 1.) * atan(inSpeed * (zoom - 1.));
                        outputPointSize = pointSize * scale;
                    }
                    gl_PointSize = max(outputPointSize, ${ScatterChart.MIN_POINT_SIZE.toFixed(1)});
                    ${THREE.ShaderChunk['fog_vertex']}
                }
            `,
            fragmentShader: `
                uniform float opacity;

                varying vec3 vColor;

                ${THREE.ShaderChunk['common']}
                ${THREE.ShaderChunk['fog_pars_fragment']}

                void main() {
                    float r = distance(gl_PointCoord, vec2(0.5, 0.5));
                    if (r < 0.5) {
                        gl_FragColor = vec4(vColor, opacity);
                    } else {
                        discard;
                    }
                    ${THREE.ShaderChunk['fog_fragment']}
                }
            `
        });
        this.points = new THREE.Points(geometry, material);
        this.scene.add(this.points);
        this.render();
    }
}
