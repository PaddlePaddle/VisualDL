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

import React, {FunctionComponent} from 'react';
import {Trans, useTranslation} from 'react-i18next';

import Error from '~/components/Error';

const DocumentMap: Record<string, string> = {
    zh: 'https://github.com/PaddlePaddle/VisualDL/blob/develop/docs/components/README_CN.md#Hparams--超参可视化',
    en: 'https://github.com/PaddlePaddle/VisualDL/tree/develop/docs/components#Hparams--HyperParameters-Visualization'
};

const Empty: FunctionComponent = () => {
    const {i18n} = useTranslation('hyper-parameter');

    return (
        <Error>
            <Trans i18nKey="hyper-parameter:empty">
                <h4>No Hparams Data was Found.</h4>
                <p>You can try the following solutions:</p>
                <ul>
                    <li>make sure that you have used `add_scalar` to record the metrics.</li>
                    <li>make sure that the `metrics_list` of `add_hparams` includes the `tag` of `add_scalar`.</li>
                </ul>
                <p>
                    For detailed tutorials, please refer to the&nbsp;
                    <a
                        href={DocumentMap[i18n.language || String(i18n.options.fallbackLng)] ?? DocumentMap.en}
                        target="_blank"
                        rel="noreferrer"
                    >
                        VisualDL Hparams Instructions
                    </a>
                    .
                </p>
            </Trans>
        </Error>
    );
};

export default Empty;
