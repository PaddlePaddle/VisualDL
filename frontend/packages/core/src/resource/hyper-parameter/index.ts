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

// cspell:words quantile

import {ScaleMethod} from './types';

export type {
    DataListItem,
    ImportanceData,
    Indicator,
    IndicatorData,
    IndicatorGroup,
    IndicatorRaw,
    IndicatorType,
    ListItem,
    MetricData,
    Range,
    ViewData
} from './types';

export {OrderDirection, ScaleMethod} from './types';
export {format, formatIndicators, getColorScale, COLOR_MAP} from './format';
export {filter} from './filter';
export {calculateRelativeTime, chartData} from './metric';
export {default as useColorMap} from './hooks/useColorMap';
export {default as useGraph} from './hooks/useGraph';

export const DEFAULT_ORDER_INDICATOR = Symbol('DEFAULT_ORDER_INDICATOR');
export const DND_TYPE = Symbol('DND_TYPE');

export const SCALE_METHODS = [ScaleMethod.LINEAR, ScaleMethod.LOGARITHMIC, ScaleMethod.QUANTILE];
