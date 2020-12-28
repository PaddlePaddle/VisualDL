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

/**
 * This is a fork of the Karpathy's TSNE.js (original license below).
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Andrej Karpathy
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * The algorithm was originally described in this paper:
 *
 * L.J.P. van der Maaten and G.E. Hinton.
 * Visualizing High-Dimensional Data Using t-SNE. Journal of Machine Learning Research
 * 9(Nov):2579-2605, 2008.
 *
 * You can find the PDF [here](http://jmlr.csail.mit.edu/papers/volume9/vandermaaten08a/vandermaaten08a.pdf).
 */

// cSpell:words Maaten Andrej Karpathy Karpathy's randn xtod premult dists gainid

export type tSNEOptions = {
    perplexity?: number;
    epsilon?: number;
    dimension: number;
};

class GaussRandom {
    private returnV = false;
    private vVal = 0.0;

    get value(): number {
        if (this.returnV) {
            this.returnV = false;
            return this.vVal;
        }
        const u = 2 * Math.random() - 1;
        const v = 2 * Math.random() - 1;
        const r = u * u + v * v;
        if (r === 0 || r > 1) {
            return this.value;
        }
        const c = Math.sqrt((-2 * Math.log(r)) / r);
        this.vVal = v * c;
        this.returnV = true;
        return u * c;
    }
}

export default class tSNE {
    readonly dimension: number;
    epsilon = 10;
    perplexity = 30;

    private Random = new GaussRandom();

    private data = new Float32Array();
    private P: Float32Array = new Float32Array();
    private Y: number[][] = [];
    private gains: number[][] = [];
    private yStep: number[][] = [];
    private D = 0;
    private N = 0;

    private iter = 0;

    get solution() {
        return this.Y;
    }

    get step() {
        return this.iter;
    }

    constructor(options: tSNEOptions) {
        this.dimension = options.dimension;
        this.perplexity = options.perplexity ?? this.perplexity;
        this.epsilon = options.epsilon ?? this.epsilon;
    }

    private L2(x1: Float32Array, x2: Float32Array) {
        if (x1.length !== x2.length) {
            throw new Error('Cannot compare vectors with different length');
        }
        const D = x1.length;
        let d = 0;
        for (let i = 0; i < D; i++) {
            const x1i = x1[i];
            const x2i = x2[i];
            d += (x1i - x2i) * (x1i - x2i);
        }
        return d;
    }

    private randn2d(s?: number) {
        const uses = s != null;
        const x: number[][] = [];
        for (let i = 0; i < this.N; i++) {
            const xHere: number[] = [];
            for (let j = 0; j < this.dimension; j++) {
                if (uses) {
                    xHere.push(s as number);
                } else {
                    xHere.push(this.Random.value * 1e-4);
                }
            }
            x.push(xHere);
        }
        return x;
    }

    private sliceDataRow(row: number) {
        return this.data.slice(row * this.D, (row + 1) * this.D);
    }

    private xtod() {
        const dist = new Float32Array(this.N * this.N);
        for (let i = 0; i < this.N; i++) {
            for (let j = 0; j < this.N; j++) {
                const d = this.L2(this.sliceDataRow(i), this.sliceDataRow(j));
                dist[i * this.N + j] = d;
                dist[j * this.N + i] = d;
            }
        }
        return dist;
    }

    private d2p(D: Float32Array, tol = 1e-4) {
        const Nf = Math.sqrt(D.length);
        const N = Math.floor(Nf);
        if (Nf !== N) {
            throw new Error('Distance is not a square matrix');
        }
        const hTarget = Math.log(this.perplexity);
        const P = new Float32Array(N * N);

        const pRow = new Float32Array(N);

        for (let i = 0; i < N; i++) {
            let betaMin = Number.NEGATIVE_INFINITY;
            let betaMax = Number.POSITIVE_INFINITY;
            let beta = 1;
            const maxTries = 50;

            let num = 0;
            while (num < maxTries) {
                let pSum = 0.0;
                for (let j = 0; j < N; j++) {
                    let pj = Math.exp(-D[i * N + j] * beta);
                    if (i === j) {
                        pj = 0;
                    }
                    pRow[j] = pj;
                    pSum += pj;
                }

                let hHere = 0.0;
                for (let j = 0; j < N; j++) {
                    const pj = pSum === 0 ? 0 : pRow[j] / pSum;
                    pRow[j] = pj;
                    if (pj > 1e-7) {
                        hHere -= pj * Math.log(pj);
                    }
                }

                if (hHere > hTarget) {
                    betaMin = beta;
                    if (betaMax === Number.POSITIVE_INFINITY) {
                        beta *= 2;
                    } else {
                        beta = (beta + betaMax) / 2;
                    }
                } else {
                    betaMax = beta;
                    if (betaMin === Number.NEGATIVE_INFINITY) {
                        beta /= 2;
                    } else {
                        beta = (beta + betaMin) / 2;
                    }
                }

                num++;
                if (Math.abs(hHere - hTarget) < tol) {
                    break;
                }
            }

            for (let j = 0; j < N; j++) {
                P[i * N + j] = pRow[j];
            }
        }

        const pOut = new Float32Array(N * N);
        const N2 = N * 2;
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                pOut[i * N + j] = Math.max((P[i * N + j] + P[j * N + i]) / N2, Number.EPSILON);
            }
        }

        return pOut;
    }

    private costGrad() {
        const Y = this.Y;
        const N = this.N;
        const dim = this.dimension;
        const P = this.P;
        const NN = N * N;

        const pMul = this.iter < 100 ? 4 : 1;

        const Qu = new Float32Array(NN);
        let qSum = 0.0;
        for (let i = 0; i < N; i++) {
            for (let j = i + 1; j < N; j++) {
                let dSum = 0.0;
                for (let d = 0; d < dim; d++) {
                    const dHere = Y[i][d] - Y[j][d];
                    dSum += dHere * dHere;
                }
                const qu = 1.0 / (1.0 + dSum);
                Qu[i * N + j] = qu;
                Qu[j * N + i] = qu;
                qSum += 2 * qu;
            }
        }

        const Q = new Float32Array(NN);
        for (let q = 0; q < NN; q++) {
            Q[q] = Math.max(Qu[q] / qSum, Number.EPSILON);
        }

        let cost = 0.0;
        const grad: number[][] = [];
        for (let i = 0; i < N; i++) {
            const gSum = Array.from<number>({length: dim}).fill(0.0);
            for (let j = 0; j < N; j++) {
                cost += -P[i * N + j] * Math.log(Q[i * N + j]);
                const premult = 4 * (pMul * P[i * N + j] - Q[i * N + j]) * Qu[i * N + j];
                for (let d = 0; d < dim; d++) {
                    gSum[d] += premult * (Y[i][d] - Y[j][d]);
                }
            }
            grad.push(gSum);
        }

        return {cost, grad};
    }

    setData(data: Float32Array, dimension: number) {
        if (data.length && dimension && data.length % dimension !== 0) {
            throw Error('Wrong data shape');
        }
        if (data.length === 0 || dimension === 0) {
            return;
        }
        this.data = data;
        this.D = dimension;
        this.N = data.length / dimension;
        const dists = this.xtod();
        this.P = this.d2p(dists);
        this.Y = this.randn2d();
        this.gains = this.randn2d(1.0);
        this.yStep = this.randn2d(0.0);
        this.iter = 0;
    }

    setPerplexity(perplexity: number) {
        this.perplexity = perplexity;
    }

    setEpsilon(epsilon: number) {
        this.epsilon = epsilon;
    }

    run() {
        this.iter++;
        const N = this.N;
        const {cost, grad} = this.costGrad();

        const yMean = new Float32Array(this.dimension);
        for (let i = 0; i < N; i++) {
            for (let d = 0; d < this.dimension; d++) {
                const gid = grad[i][d];
                const sid = this.yStep[i][d];
                const gainid = this.gains[i][d];

                let newGain = Math.sign(gid) === Math.sign(sid) ? gainid * 0.8 : gainid + 0.2;
                if (newGain < 0.01) {
                    newGain = 0.01;
                }
                this.gains[i][d] = newGain;

                const momVal = this.iter < 250 ? 0.5 : 0.8;
                const newSid = momVal * sid - this.epsilon * newGain * grad[i][d];
                this.yStep[i][d] = newSid;

                this.Y[i][d] += newSid;

                yMean[d] += this.Y[i][d];
            }
        }

        for (let i = 0; i < N; i++) {
            for (let d = 0; d < this.dimension; d++) {
                this.Y[i][d] -= yMean[d] / N;
            }
        }

        return cost;
    }
}
