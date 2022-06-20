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

const API_URL = import.meta.env?.SNOWPACK_PUBLIC_API_URL ?? '';

export async function initMock() {
    const {default: fetchMock} = await import('fetch-mock/esm/client');

    fetchMock.config.overwriteRoutes = true;
    fetchMock.config.fallbackToNetwork = true;

    fetchMock.mock(`begin:${API_URL}`, async (url, opts, req) => {
        try {
            const request = req || new Request(url, opts);
            const parsedUrl = new URL(request.url);
            const path = parsedUrl.pathname.replace(API_URL, '');
            const {default: mock} = await import(`./data${path}.js`);
            if ('function' === typeof mock) {
                return await mock({
                    query: [...parsedUrl.searchParams.entries()].reduce((acc, tuple) => {
                        const [key, val] = tuple;
                        if (acc.hasOwnProperty(key)) {
                            if (Array.isArray(acc[key])) {
                                acc[key] = [...acc[key], val];
                            } else {
                                acc[key] = [acc[key], val];
                            }
                        } else {
                            acc[key] = val;
                        }

                        return acc;
                    }, {})
                });
            }
            return mock;
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
            return 500;
        }
    });
}
