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

import FileSaver from 'file-saver';
import JSZip from 'jszip';
import {fetcher} from '~/utils/fetch';
import isString from 'lodash/isString';
import {toast} from 'react-toastify';

async function getFile(url: string): Promise<string | Blob> {
    const result = await fetcher(url);
    if (result.data instanceof Blob) {
        return result.data;
    } else if (!isString(result)) {
        return JSON.stringify(result);
    }
    return result;
}

function normalizeFilename(name: string) {
    return name.replace(/[/\\?%*:|"<>]/g, '_');
}

export function saveFile(file: string | Blob, filename: string) {
    let blob: Blob;
    if (file instanceof Blob) {
        blob = file;
    } else {
        blob = new Blob([file], {type: 'text/plain;charset=utf-8'});
    }
    FileSaver.saveAs(blob, normalizeFilename(filename));
}

export default async function (url: string | string[], filename: string | string[], zipFilename = 'download.zip') {
    if (!url) {
        return;
    }
    let urls: string[] = url as string[];
    let filenames: string[] = filename as string[];
    if (isString(url)) {
        urls = [url];
    }
    if (isString(filename)) {
        filenames = [filename];
    }
    try {
        const data = await Promise.all(urls.map(getFile));
        if (data.length === 1) {
            saveFile(data[0], filenames[0]);
        } else {
            const zip = new JSZip();
            let basename = '';
            let extname = '';
            if (filenames.length === 1) {
                const filenameArr = filenames[0].split('.');
                if (filenameArr.length > 1) {
                    extname = filenameArr.pop() as string;
                }
                basename = filenameArr.join('.');
            }
            data.forEach((file, index) => {
                zip.file(normalizeFilename(basename ? `${basename} - ${index}.${extname}` : filenames[index]), file);
            });
            const zipFile = await zip.generateAsync({type: 'blob'});
            saveFile(zipFile, zipFilename);
        }
    } catch (e) {
        toast(e.message, {
            position: toast.POSITION.TOP_CENTER,
            type: toast.TYPE.ERROR
        });
    }
}
