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

import React, {FunctionComponent, useState} from 'react';

import Button from '~/components/Button';
import Field from '~/components/Field';
import Slider from '~/components/Slider';
import {useTranslation} from 'react-i18next';

export type UMAPDetailProps = {
    neighbors: number;
    onRun?: (neighbors: number) => void;
};

const UMAPDetail: FunctionComponent<UMAPDetailProps> = ({neighbors, onRun}) => {
    const {t} = useTranslation('high-dimensional');

    const [localNeighbors, setNeighbors] = useState(neighbors);

    return (
        <>
            <Field label={t('high-dimensional:neighbors')}>
                <Slider min={5} max={50} step={1} value={localNeighbors} onChange={setNeighbors} />
            </Field>
            <Field>
                <Button type="primary" outline rounded onClick={() => onRun?.(localNeighbors)}>
                    {t('high-dimensional:run')}
                </Button>
            </Field>
        </>
    );
};

export default UMAPDetail;
