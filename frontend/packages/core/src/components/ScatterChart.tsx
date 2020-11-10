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

import * as THREE from 'three';
import * as d3 from 'd3';

import React, {useCallback, useEffect, useImperativeHandle, useRef} from 'react';

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import type {WithStyled} from '~/utils/style';
import styled from 'styled-components';
import {themes} from '~/utils/theme';
import useTheme from '~/hooks/useTheme';

/**
 * The length of the cube (diameter of the circumscribing sphere) where all the
 * points live.
 */
const CUBE_LENGTH = 2;
const MAX_ZOOM = 5 * CUBE_LENGTH;
const MIN_ZOOM = 0.025 * CUBE_LENGTH;
// Constants relating to the camera parameters.
const PERSP_CAMERA_FOV_VERTICAL = 70;
const PERSP_CAMERA_NEAR_CLIP_PLANE = 0.01;
const PERSP_CAMERA_FAR_CLIP_PLANE = 100;
const ORTHO_CAMERA_FRUSTUM_HALF_EXTENT = 1.2;
const ORBIT_MOUSE_ROTATION_SPEED = 1;
const ORBIT_ANIMATION_ROTATION_CYCLE_IN_SECONDS = 2;
const NUM_POINTS_FOG_THRESHOLD = 5000;
const MIN_POINT_SIZE = 5;

const POINT_COLOR_NO_SELECTION = 0x7575d9;

const PERSP_CAMERA_INIT_POSITION = [0.45, 0.9, 1.6] as const;
const ORTHO_CAMERA_INIT_POSITION = [0, 0, 4] as const;

const initScene = (background: string) => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(background);
    const light = new THREE.PointLight(16772287, 1, 0);
    light.name = 'light';
    scene.add(light);
    scene.fog = new THREE.Fog(0xffffff);
    return scene;
};
const initCamera = (width: number, height: number, is3D: boolean) => {
    const origin = new THREE.Vector3(0, 0, 0);
    let camera: THREE.OrthographicCamera | THREE.PerspectiveCamera;
    if (is3D) {
        camera = new THREE.PerspectiveCamera(
            PERSP_CAMERA_FOV_VERTICAL,
            width / height,
            PERSP_CAMERA_NEAR_CLIP_PLANE,
            PERSP_CAMERA_FAR_CLIP_PLANE
        );
        camera.position.set(...PERSP_CAMERA_INIT_POSITION);
    } else {
        camera = new THREE.OrthographicCamera(
            -ORTHO_CAMERA_FRUSTUM_HALF_EXTENT,
            ORTHO_CAMERA_FRUSTUM_HALF_EXTENT,
            ORTHO_CAMERA_FRUSTUM_HALF_EXTENT,
            -ORTHO_CAMERA_FRUSTUM_HALF_EXTENT,
            -1000,
            1000
        );
        camera.position.set(...ORTHO_CAMERA_INIT_POSITION);
        camera.up = new THREE.Vector3(0, 1, 0);
    }
    camera.lookAt(origin);
    camera.zoom = 1;
    camera.updateProjectionMatrix();
    return camera;
};
const initRenderer = (canvas: HTMLCanvasElement, width: number, height: number, backgroundColor: string) => {
    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        premultipliedAlpha: false,
        antialias: false
    });
    renderer.setClearColor(backgroundColor, 1);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(width, height);
    return renderer;
};

const Canvas = styled.canvas<{dark?: boolean}>`
    filter: ${props =>
        props.dark ? 'invert(99%) sepia(7%) saturate(5670%) hue-rotate(204deg) brightness(96%) contrast(79%)' : ''};
`;

export type ScatterChartProps = {
    width: number;
    height: number;
    data: [number, number, number][];
    is3D: boolean;
};

export type ScatterChartRef = {
    reset(): void;
};

const ScatterChart = React.forwardRef<ScatterChartRef, ScatterChartProps & WithStyled>(
    ({width, height, data, is3D, className}, ref) => {
        const theme = useTheme();
        const initOptions = useRef({
            width,
            height,
            is3D
        });
        const dataRef = useRef(data);

        const chart = useRef<HTMLCanvasElement>(null);
        const scene = useRef<THREE.Scene>(initScene(themes.light.backgroundColor));
        const camera = useRef<THREE.OrthographicCamera | THREE.PerspectiveCamera>(initCamera(width, height, is3D));
        const renderer = useRef<THREE.WebGLRenderer | null>(null);
        const controls = useRef<OrbitControls | null>(null);
        // const pickingScene = useRef<THREE.Scene>(new THREE.Scene());
        // const pickingTexture = useRef<THREE.WebGLRenderTarget>(new THREE.WebGLRenderTarget(1, 1));

        const render = useCallback(() => {
            const s = scene.current;
            const c = camera.current;
            const cameraPos = c.position;
            const lightPos = cameraPos.clone();
            lightPos.x += 1;
            lightPos.y += 1;
            const light = s.getObjectByName('light');
            light?.position.set(lightPos.x, lightPos.y, lightPos.z);

            const points = s.getObjectByName('points') as THREE.Points | null;
            if (points) {
                const material = points.material as THREE.ShaderMaterial;
                material.uniforms.color.value = new THREE.Color(POINT_COLOR_NO_SELECTION);
            }

            const fog = s.fog as THREE.Fog | null;
            if (fog) {
                if (c instanceof THREE.PerspectiveCamera) {
                    const cameraTarget = controls.current?.target ?? new THREE.Vector3();
                    let shortestDist = Number.POSITIVE_INFINITY;
                    let furthestDist = 0;
                    const camToTarget = new THREE.Vector3().copy(cameraTarget).sub(cameraPos);
                    const camPlaneNormal = new THREE.Vector3().copy(camToTarget).normalize();

                    const camToPoint = new THREE.Vector3();
                    dataRef.current.forEach(d => {
                        camToPoint.copy(new THREE.Vector3(...d)).sub(cameraPos);
                        const dist = camPlaneNormal.dot(camToPoint);
                        if (dist < 0) {
                            return;
                        }
                        furthestDist = dist > furthestDist ? dist : furthestDist;
                        shortestDist = dist < shortestDist ? dist : shortestDist;
                    });
                    const multiplier =
                        2 - Math.min(dataRef.current.length, NUM_POINTS_FOG_THRESHOLD) / NUM_POINTS_FOG_THRESHOLD;
                    fog.near = shortestDist;
                    fog.far = furthestDist * multiplier;
                } else {
                    fog.near = Number.POSITIVE_INFINITY;
                    fog.far = Number.POSITIVE_INFINITY;
                }
                if (points) {
                    const material = points.material as THREE.ShaderMaterial;
                    material.uniforms.fogColor.value = fog.color;
                    material.uniforms.fogNear.value = fog.near;
                    material.uniforms.fogFar.value = fog.far;
                }
            }

            if (renderer.current) {
                renderer.current.setRenderTarget(null);
                renderer.current.render(scene.current, camera.current);
            }
        }, []);

        const animation = useRef(is3D);
        const animationId = useRef<number | null>(null);

        const rotate = useCallback(() => {
            animation.current = true;
            const co = controls.current;
            if (co) {
                co.autoRotate = true;
                co.autoRotateSpeed = ORBIT_ANIMATION_ROTATION_CYCLE_IN_SECONDS;
                const innerRotate = () => {
                    co.update();
                    animationId.current = requestAnimationFrame(innerRotate);
                };
                innerRotate();
            }
        }, []);

        const stopRotate = useCallback(() => {
            animation.current = false;
            const co = controls.current;
            if (co) {
                co.autoRotate = false;
                co.rotateSpeed = ORBIT_MOUSE_ROTATION_SPEED;
            }
            if (animationId.current != null) {
                cancelAnimationFrame(animationId.current);
                animationId.current = null;
            }
        }, []);

        const mousemove = useCallback<React.MouseEventHandler<HTMLCanvasElement>>(() => {
            if (renderer.current && camera.current) {
                // renderer.current.setRenderTarget(pickingTexture.current);
                // renderer.current.render(pickingScene.current, camera.current);
                // const pixelBuffer = new Uint8Array(4);
                // renderer.current.readRenderTargetPixels(pickingTexture.current, 0, 0, 1, 1, pixelBuffer);
                // const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | pixelBuffer[2];
                // console.log(id);
            }
        }, []);

        useEffect(() => {
            const c = chart.current;
            if (c) {
                const options = initOptions.current;
                const backgroundColor = themes.light.backgroundColor;
                const r = initRenderer(c, options.width, options.height, backgroundColor);

                renderer.current = r;

                return () => {
                    r.dispose();
                };
            }
        }, []);

        useEffect(() => {
            const r = renderer.current;
            if (r) {
                const s = scene.current;
                const target = new THREE.Vector2();
                r.getSize(target);
                const ca = initCamera(target.x, target.y, is3D);
                const co = new OrbitControls(ca, r.domElement);
                co.enableRotate = is3D;
                co.autoRotate = false;
                co.rotateSpeed = ORBIT_MOUSE_ROTATION_SPEED;
                co.minDistance = MIN_ZOOM;
                co.maxDistance = MAX_ZOOM;
                co.mouseButtons.LEFT = is3D ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN;
                co.reset();

                co.addEventListener('start', () => {
                    stopRotate();
                    animation.current = false;
                });
                co.addEventListener('change', () => {
                    render();
                });

                camera.current = ca;
                controls.current = co;

                if (is3D) {
                    const axes = new THREE.AxesHelper();
                    axes.name = 'axes';
                    s.add(axes);

                    if (animation.current) {
                        rotate();
                    }
                }

                return () => {
                    stopRotate();
                    const axes = s.getObjectByName('axes');
                    if (axes) {
                        s.remove(axes);
                    }
                    co.dispose();
                };
            }
        }, [is3D, render, rotate, stopRotate]);

        const reset = useCallback(() => {
            const co = controls.current;
            if (co) {
                co.reset();
                if (is3D && !animation.current) {
                    rotate();
                }
            }
            render();
        }, [render, is3D, rotate]);

        useEffect(() => {
            dataRef.current = data;

            // pickingScene.current.clear();
            const s = scene.current;
            const p = s.getObjectByName('points');
            if (p) {
                s.remove(p);
            }

            const xScaler = d3.scaleLinear();
            const yScaler = d3.scaleLinear();
            let zScaler: d3.ScaleLinear<number, number> | null = null;
            const xExtent = d3.extent(data, (_p, i) => data[i][0]) as [number, number];
            const yExtent = d3.extent(data, (_p, i) => data[i][1]) as [number, number];
            const range = [-CUBE_LENGTH / 2, CUBE_LENGTH / 2];
            xScaler.domain(xExtent).range(range);
            yScaler.domain(yExtent).range(range);
            if (is3D) {
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

            const fog = s.fog as THREE.Fog | null;
            const material = new THREE.ShaderMaterial({
                transparent: true,
                depthTest: false,
                depthWrite: false,
                fog: true,
                blending: THREE.MultiplyBlending,
                uniforms: {
                    pointSize: {value: 200 / Math.log(data.length) / Math.log(8) / (is3D ? 1 : 1.5)},
                    scale: {value: 1},
                    color: {value: new THREE.Color()},
                    opacity: {value: 1},
                    sizeAttenuation: {value: is3D},
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
                        gl_PointSize = max(outputPointSize, ${MIN_POINT_SIZE.toFixed(1)});
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
            const points = new THREE.Points(geometry, material);
            points.name = 'points';
            s.add(points);
            // pickingScene.current.add(new THREE.Points(geometry, material));
            reset();
        }, [is3D, data, reset]);

        useEffect(() => {
            const c = camera.current;
            if (c instanceof THREE.PerspectiveCamera) {
                c.aspect = width / height;
                c.updateProjectionMatrix();
            }
            controls.current?.update();
            renderer.current?.setSize(width, height);
        }, [width, height]);

        useImperativeHandle(ref, () => ({
            reset: () => {
                reset();
            }
        }));

        return <Canvas className={className} ref={chart} dark={theme === 'dark'} onMouseMove={mousemove} />;
    }
);

export default ScatterChart;
