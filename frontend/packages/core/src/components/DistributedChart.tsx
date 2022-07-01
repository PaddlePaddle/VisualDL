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

import * as chart from '~/utils/chart';

import React, {useEffect, useImperativeHandle} from 'react';
import {WithStyled, primaryColor} from '~/utils/style';
import useECharts, {Options, Wrapper, useChartTheme} from '~/hooks/useECharts';
import {color, colorAlt} from '~/utils/chart';
import type {EChartOption} from 'echarts';
import GridLoader from 'react-spinners/GridLoader';
import defaultsDeep from 'lodash/defaultsDeep';
import {formatTime} from '~/utils';
import {useTranslation} from 'react-i18next';

type LineChartProps = {
    options?: EChartOption;
    title?: string;
    data?: Partial<NonNullable<EChartOption<EChartOption.SeriesLine>['series']>>;
    loading?: boolean;
    zoom?: boolean;
    onInit?: Options['onInit'];
};

export enum XAxisType {
    value = 'value',
    log = 'log',
    time = 'time'
}

export enum YAxisType {
    value = 'value',
    log = 'log'
}

export type LineChartRef = {
    restore(): void;
    saveAsImage(): void;
};

const DistributedChart = React.forwardRef<LineChartRef, any>(
    ({options, data, title, loading, zoom, className, onInit, isCpu}, ref) => {
        const {i18n} = useTranslation();

        const {
            ref: echartRef,
            echart,
            wrapper,
            saveAsImage
        } = useECharts<HTMLDivElement>({
            loading: !!loading,
            zoom,
            autoFit: true,
            onInit
        });

        const theme = useChartTheme();

        useImperativeHandle(ref, () => ({
            restore: () => {
                echart?.dispatchAction({
                    type: 'restore'
                });
            },
            saveAsImage: () => {
                saveAsImage(title);
            }
        }));

        useEffect(() => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {color, colorAlt, series, ...defaults} = chart;
            const chartData = true;
            if (chartData) {
                //  for (const item of data) {
                //      chartData.push({
                //          value: item.total_time,
                //          name: item.name,
                //          proportion: item.ratio
                //      });
                //  }
                console.log('chartData', chartData);
                const title = 'Peak Memory Usage: 0.4MB'
                let chartOptions: EChartOption = defaultsDeep({
                    color: ['#5793f3', '#d14a61', '#368c6c', '#675bba'],
                    // backgroundColor: 'rgb(128, 128, 128, .04)',
                    title: {
                        top: '5%',
                        left: '0%',
                        show: true,
                        text: title,
                        textStyle: {
                            color: '#666666',
                            fontStyle: 'PingFangSC-Regular',
                            fontWeight: '400',
                            fontSize: 12
                        }
                    },
                    legend: {
                        type: 'plain',
                        show: true,
                        left: 'center',
                        data: [
                            {
                                name: '日增量'
                            },
                            {
                                name: '当前数量'
                            },
                            {
                                name: 'value大小'
                            }
                        ]
                    },
                    tooltip: {
                        trigger: 'axis',
                        formatter: {
                            _custom: {
                                type: 'function',
                                display: '<span>ƒ</span> formatter(params, ticket, callback)'
                            }
                        }
                    },
                    dataset: {
                        source: [
                            {
                                day: '2019/12/31',
                                value: 36858098,
                                incre: 0
                            },
                            {
                                day: '2020/1/1',
                                value: 37172990,
                                incre: 1627
                            },
                            {
                                day: '2020/1/2',
                                value: 37488162,
                                incre: 1297
                            },
                            {
                                day: '2020/1/3',
                                value: 37705571,
                                incre: 1184
                            },
                            {
                                day: '2020/1/4',
                                value: 38025383,
                                incre: 1491
                            },
                            {
                                day: '2020/1/5',
                                value: 38428646,
                                incre: 1878
                            },
                            {
                                day: '2020/1/6',
                                value: 38816948,
                                incre: 1811
                            },
                            {
                                day: '2020/1/7',
                                value: 39155578,
                                incre: 1394
                            },
                            {
                                day: '2020/1/8',
                                value: 39407727,
                                incre: 1353
                            },
                            {
                                day: '2020/1/9',
                                value: 39699764,
                                incre: 1362
                            },
                            {
                                day: '2020/1/10',
                                value: 39967392,
                                incre: 1067
                            },
                            {
                                day: '2020/1/11',
                                value: 40172751,
                                incre: 959
                            },
                            {
                                day: '2020/1/12',
                                value: 40455239,
                                incre: 1318
                            },
                            {
                                day: '2020/1/13',
                                value: 40738954,
                                incre: 1323
                            },
                            {
                                day: '2020/1/14',
                                value: 40967652,
                                incre: 1066
                            },
                            {
                                day: '2020/1/15',
                                value: 41180273,
                                incre: 991
                            },
                            {
                                day: '2020/1/16',
                                rows: 193142,
                                value: 41312366,
                                incre: 805
                            },
                            {
                                day: '2020/1/17',
                                value: 41528154,
                                incre: 818
                            },
                            {
                                day: '2020/1/18',
                                value: 41669689,
                                incre: 853
                            },
                            {
                                day: '2020/1/19',
                                value: 41957204,
                                incre: 1147
                            },
                            {
                                day: '2020/1/20',
                                value: 42133463,
                                incre: 1016
                            },
                            {
                                day: '2020/1/21',
                                value: 42340727,
                                incre: 970
                            },
                            {
                                day: '2020/1/22',
                                value: 42516775,
                                incre: 821
                            },
                            {
                                day: '2020/1/23',
                                value: 42741515,
                                incre: 854
                            },
                            {
                                day: '2020/1/24',
                                value: 42854294,
                                incre: 721
                            },
                            {
                                day: '2020/1/25',
                                value: 43006739,
                                incre: 713
                            },
                            {
                                day: '2020/1/26',
                                value: 43223327,
                                incre: 1011
                            },
                            {
                                day: '2020/1/27',
                                value: 43487413,
                                incre: 1035
                            },
                            {
                                day: '2020/1/28',
                                value: 43637019,
                                incre: 698
                            },
                            {
                                day: '2020/1/29',
                                value: 43802879,
                                incre: 772
                            },
                            {
                                day: '2020/1/30',
                                value: 43921981,
                                incre: 759
                            },
                            {
                                day: '2020/1/31',
                                value: 44108273,
                                incre: 667
                            },
                            {
                                day: '2020/2/1',
                                value: 44263203,
                                incre: 690
                            },
                            {
                                day: '2020/2/2',
                                value: 44466060,
                                incre: 931
                            },
                            {
                                day: '2020/2/3',
                                value: 44666913,
                                incre: 929
                            },
                            {
                                day: '2020/2/4',
                                value: 44794701,
                                incre: 592
                            },
                            {
                                day: '2020/2/5',
                                value: 44917278,
                                incre: 563
                            },
                            {
                                day: '2020/2/6',
                                value: 44987461,
                                incre: 529
                            },
                            {
                                day: '2020/2/7',
                                value: 45137502,
                                incre: 487
                            },
                            {
                                day: '2020/2/8',
                                value: 45213301,
                                incre: 557
                            },
                            {
                                day: '2020/2/9',
                                value: 45414298,
                                incre: 727
                            },
                            {
                                day: '2020/2/10',
                                value: 45537039,
                                incre: 780
                            },
                            {
                                day: '2020/2/11',
                                value: 45648214,
                                incre: 516
                            },
                            {
                                day: '2020/2/12',
                                value: 45767952,
                                incre: 555
                            },
                            {
                                day: '2020/2/13',
                                value: 45935388,
                                incre: 569
                            },
                            {
                                day: '2020/2/14',
                                value: 46044398,
                                incre: 506
                            },
                            {
                                day: '2020/2/15',
                                value: 46161370,
                                incre: 546
                            },
                            {
                                day: '2020/2/16',
                                value: 46316328,
                                incre: 722
                            },
                            {
                                day: '2020/2/17',
                                value: 46482683,
                                incre: 775
                            },
                            {
                                day: '2020/2/18',
                                value: 46607209,
                                incre: 578
                            },
                            {
                                day: '2020/2/19',
                                value: 46720407,
                                incre: 526
                            },
                            {
                                day: '2020/2/20',
                                value: 46827240,
                                incre: 499
                            },
                            {
                                day: '2020/2/21',
                                value: 46919677,
                                incre: 429
                            },
                            {
                                day: '2020/2/22',
                                value: 47020113,
                                incre: 466
                            },
                            {
                                day: '2020/2/23',
                                value: 47156954,
                                incre: 639
                            },
                            {
                                day: '2020/2/24',
                                value: 47297391,
                                incre: 653
                            },
                            {
                                day: '2020/2/25',
                                value: 47408192,
                                incre: 517
                            },
                            {
                                day: '2020/2/26',
                                value: 47504417,
                                incre: 529
                            },
                            {
                                day: '2020/2/27',
                                value: 47598626,
                                incre: 471
                            },
                            {
                                day: '2020/2/28',
                                value: 47687986,
                                incre: 432
                            },
                            {
                                day: '2020/2/29',
                                value: 47809262,
                                incre: 504
                            },
                            {
                                day: '2020/3/1',
                                value: 47949416,
                                incre: 638
                            },
                            {
                                day: '2020/3/2',
                                value: 48079478,
                                incre: 594
                            },
                            {
                                day: '2020/3/3',
                                value: 48188581,
                                incre: 503
                            },
                            {
                                day: '2020/3/4',
                                value: 48285769,
                                incre: 444
                            },
                            {
                                day: '2020/3/5',
                                value: 48386370,
                                incre: 467
                            },
                            {
                                day: '2020/3/6',
                                value: 48485192,
                                incre: 456
                            },
                            {
                                day: '2020/3/7',
                                value: 48587824,
                                incre: 478
                            },
                            {
                                day: '2020/3/8',
                                value: 48713797,
                                incre: 585
                            },
                            {
                                day: '2020/3/9',
                                value: 48852796,
                                incre: 645
                            },
                            {
                                day: '2020/3/10',
                                value: 48956141,
                                incre: 483
                            },
                            {
                                day: '2020/3/11',
                                value: 49066438,
                                incre: 511
                            },
                            {
                                day: '2020/3/12',
                                value: 49174248,
                                incre: 504
                            },
                            {
                                day: '2020/3/13',
                                value: 49278325,
                                incre: 483
                            },
                            {
                                day: '2020/3/14',
                                value: 49374502,
                                incre: 449
                            },
                            {
                                day: '2020/3/15',
                                value: 49494012,
                                incre: 556
                            },
                            {
                                day: '2020/3/16',
                                value: 49618822,
                                incre: 580
                            },
                            {
                                day: '2020/3/17',
                                value: 49708291,
                                incre: 417
                            },
                            {
                                day: '2020/3/18',
                                value: 49804504,
                                incre: 449
                            },
                            {
                                day: '2020/3/19',
                                value: 49920183,
                                incre: 539
                            },
                            {
                                day: '2020/3/20',
                                value: 50032487,
                                incre: 524
                            },
                            {
                                day: '2020/3/21',
                                value: 50135430,
                                incre: 479
                            },
                            {
                                day: '2020/3/22',
                                value: 50248955,
                                incre: 529
                            },
                            {
                                day: '2020/3/23',
                                value: 50362612,
                                incre: 531
                            },
                            {
                                day: '2020/3/24',
                                value: 50431436,
                                incre: 428
                            },
                            {
                                day: '2020/3/25',
                                value: 50505917,
                                incre: 405
                            },
                            {
                                day: '2020/3/26',
                                value: 50581038,
                                incre: 399
                            },
                            {
                                day: '2020/3/27',
                                value: 50657244,
                                incre: 380
                            },
                            {
                                day: '2020/3/28',
                                value: 50737606,
                                incre: 396
                            },
                            {
                                day: '2020/3/29',
                                value: 50848638,
                                incre: 528
                            },
                            {
                                day: '2020/3/30',
                                value: 50957331,
                                incre: 527
                            },
                            {
                                day: '2020/3/31',
                                value: 51073902,
                                incre: 555
                            },
                            {
                                day: '2020/4/1',
                                value: 51158039,
                                incre: 399
                            },
                            {
                                day: '2020/4/2',
                                value: 51251287,
                                incre: 488
                            },
                            {
                                day: '2020/4/3',
                                value: 51290224,
                                incre: 445
                            },
                            {
                                day: '2020/4/4',
                                value: 51355806,
                                incre: 408
                            },
                            {
                                day: '2020/4/5',
                                value: 51452275,
                                incre: 511
                            },
                            {
                                day: '2020/4/6',
                                value: 51546113,
                                incre: 480
                            },
                            {
                                day: '2020/4/7',
                                value: 51633025,
                                incre: 444
                            },
                            {
                                day: '2020/4/8',
                                value: 51723168,
                                incre: 457
                            },
                            {
                                day: '2020/4/9',
                                value: 51814193,
                                incre: 455
                            },
                            {
                                day: '2020/4/10',
                                value: 51902873,
                                incre: 440
                            },
                            {
                                day: '2020/4/11',
                                value: 51987279,
                                incre: 498
                            },
                            {
                                day: '2020/4/12',
                                value: 52111261,
                                incre: 590
                            },
                            {
                                day: '2020/4/13',
                                value: 52205334,
                                incre: 449
                            },
                            {
                                day: '2020/4/14',
                                value: 52300896,
                                incre: 458
                            },
                            {
                                day: '2020/4/15',
                                value: 52413694,
                                incre: 532
                            },
                            {
                                day: '2020/4/16',
                                value: 52539958,
                                incre: 624
                            },
                            {
                                day: '2020/4/17',
                                value: 52629470,
                                incre: 400
                            },
                            {
                                day: '2020/4/18',
                                value: 52746393,
                                incre: 541
                            },
                            {
                                day: '2020/4/19',
                                value: 52886823,
                                incre: 648
                            },
                            {
                                day: '2020/4/20',
                                value: 53011302,
                                incre: 577
                            },
                            {
                                day: '2020/4/21',
                                value: 53119273,
                                incre: 501
                            },
                            {
                                day: '2020/4/22',
                                rows: 249474,
                                value: 53216968,
                                incre: 453
                            },
                            {
                                day: '2020/4/23',
                                value: 53312250,
                                incre: 448
                            },
                            {
                                day: '2020/4/24',
                                value: 53411345,
                                incre: 465
                            },
                            {
                                day: '2020/4/25',
                                value: 53523830,
                                incre: 527
                            },
                            {
                                day: '2020/4/26',
                                value: 53631031,
                                incre: 499
                            },
                            {
                                day: '2020/4/27',
                                value: 53758661,
                                incre: 594
                            },
                            {
                                day: '2020/4/28',
                                value: 53872079,
                                incre: 532
                            },
                            {
                                day: '2020/4/29',
                                value: 53987787,
                                incre: 544
                            },
                            {
                                day: '2020/4/30',
                                value: 54104678,
                                incre: 551
                            },
                            {
                                day: '2020/5/1',
                                value: 54226429,
                                incre: 569
                            },
                            {
                                day: '2020/5/2',
                                value: 54337148,
                                incre: 521
                            },
                            {
                                day: '2020/5/3',
                                value: 54465512,
                                incre: 598
                            },
                            {
                                day: '2020/5/4',
                                value: 54568264,
                                incre: 486
                            },
                            {
                                day: '2020/5/5',
                                value: 54673704,
                                incre: 494
                            },
                            {
                                day: '2020/5/6',
                                value: 54787233,
                                incre: 533
                            },
                            {
                                day: '2020/5/7',
                                value: 54898500,
                                incre: 521
                            },
                            {
                                day: '2020/5/8',
                                value: 55022817,
                                incre: 585
                            },
                            {
                                day: '2020/5/9',
                                value: 55167758,
                                incre: 677
                            },
                            {
                                day: '2020/5/10',
                                value: 55317473,
                                incre: 697
                            },
                            {
                                day: '2020/5/11',
                                value: 55455636,
                                incre: 643
                            },
                            {
                                day: '2020/5/12',
                                value: 55591432,
                                incre: 636
                            },
                            {
                                day: '2020/5/13',
                                value: 55722433,
                                incre: 615
                            },
                            {
                                day: '2020/5/14',
                                value: 55844231,
                                incre: 572
                            },
                            {
                                day: '2020/5/15',
                                value: 55951822,
                                incre: 505
                            },
                            {
                                day: '2020/5/16',
                                value: 56055186,
                                incre: 520
                            },
                            {
                                day: '2020/5/17',
                                value: 56174332,
                                incre: 574
                            },
                            {
                                day: '2020/5/18',
                                value: 56291201,
                                incre: 559
                            },
                            {
                                day: '2020/5/19',
                                value: 56394334,
                                incre: 507
                            },
                            {
                                day: '2020/5/21',
                                value: 56589435,
                                incre: 919
                            },
                            {
                                day: '2020/5/22',
                                value: 56708156,
                                incre: 533
                            },
                            {
                                day: '2020/5/23',
                                value: 56808417,
                                incre: 517
                            },
                            {
                                day: '2020/5/24',
                                value: 56942809,
                                incre: 640
                            },
                            {
                                day: '2020/5/25',
                                value: 57075325,
                                incre: 568
                            },
                            {
                                day: '2020/5/26',
                                value: 57215461,
                                incre: 650
                            },
                            {
                                day: '2020/5/27',
                                value: 57334177,
                                incre: 550
                            },
                            {
                                day: '2020/5/28',
                                value: 57470221,
                                incre: 624
                            },
                            {
                                day: '2020/5/29',
                                value: 57619988,
                                incre: 697
                            },
                            {
                                day: '2020/5/30',
                                value: 57725873,
                                incre: 499
                            },
                            {
                                day: '2020/5/31',
                                value: 57862034,
                                incre: 631
                            },
                            {
                                day: '2020/6/1',
                                value: 57991385,
                                incre: 607
                            },
                            {
                                day: '2020/6/2',
                                value: 58112356,
                                incre: 515
                            },
                            {
                                day: '2020/6/3',
                                value: 58241216,
                                incre: 584
                            },
                            {
                                day: '2020/6/4',
                                value: 58325937,
                                incre: 533
                            },
                            {
                                day: '2020/6/5',
                                value: 58434397,
                                incre: 540
                            },
                            {
                                day: '2020/6/6',
                                value: 58541120,
                                incre: 519
                            },
                            {
                                day: '2020/6/7',
                                value: 58667592,
                                incre: 612
                            },
                            {
                                day: '2020/6/8',
                                value: 58781620,
                                incre: 550
                            },
                            {
                                day: '2020/6/9',
                                value: 58883635,
                                incre: 513
                            },
                            {
                                day: '2020/6/10',
                                value: 58987109,
                                incre: 486
                            },
                            {
                                day: '2020/6/11',
                                value: 59096050,
                                incre: 511
                            },
                            {
                                day: '2020/6/12',
                                value: 59189730,
                                incre: 442
                            },
                            {
                                day: '2020/6/13',
                                value: 59288991,
                                incre: 465
                            },
                            {
                                day: '2020/6/14',
                                value: 59395772,
                                incre: 503
                            },
                            {
                                day: '2020/6/15',
                                value: 59505767,
                                incre: 525
                            },
                            {
                                day: '2020/6/16',
                                value: 59614885,
                                incre: 514
                            },
                            {
                                day: '2020/6/17',
                                value: 59728222,
                                incre: 531
                            },
                            {
                                day: '2020/6/18',
                                value: 59826290,
                                incre: 460
                            },
                            {
                                day: '2020/6/19',
                                value: 59945617,
                                incre: 563
                            },
                            {
                                day: '2020/6/20',
                                value: 60039014,
                                incre: 417
                            },
                            {
                                day: '2020/6/21',
                                value: 60164463,
                                incre: 565
                            },
                            {
                                day: '2020/6/22',
                                value: 60293337,
                                incre: 590
                            },
                            {
                                day: '2020/6/23',
                                value: 60423873,
                                incre: 606
                            },
                            {
                                day: '2020/6/24',
                                value: 60523929,
                                incre: 462
                            },
                            {
                                day: '2020/6/25',
                                value: 60633039,
                                incre: 508
                            },
                            {
                                day: '2020/6/26',
                                value: 60720506,
                                incre: 409
                            },
                            {
                                day: '2020/6/27',
                                value: 60808163,
                                incre: 409
                            },
                            {
                                day: '2020/6/28',
                                value: 60936999,
                                incre: 598
                            },
                            {
                                day: '2020/6/29',
                                value: 61051801,
                                incre: 536
                            },
                            {
                                day: '2020/6/30',
                                value: 61158533,
                                incre: 434
                            },
                            {
                                day: '2020/7/1',
                                value: 61258924,
                                incre: 503
                            },
                            {
                                day: '2020/7/2',
                                value: 61355428,
                                incre: 522
                            },
                            {
                                day: '2020/7/3',
                                value: 61438402,
                                incre: 440
                            },
                            {
                                day: '2020/7/4',
                                value: 61541156,
                                incre: 510
                            },
                            {
                                day: '2020/7/6',
                                value: 61686397,
                                incre: 729
                            },
                            {
                                day: '2020/7/7',
                                value: 61774527,
                                incre: 424
                            },
                            {
                                day: '2020/7/8',
                                value: 61892226,
                                incre: 503
                            },
                            {
                                day: '2020/7/9',
                                value: 62007528,
                                incre: 520
                            },
                            {
                                day: '2020/7/10',
                                value: 62132028,
                                incre: 570
                            }
                        ]
                    },
                    xAxis: [
                        {
                            type: 'category',
                            min: 1,
                            axisTick: {
                                show: false
                            },
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            name: '内存使用量（MB）',
                            position: 'left',
                            offset: 0,
                            axisTick: {
                                show: false
                            },
                            axisLine:{
                                lineStyle:{
                                    color:'#CCCCCC'
                                }
                            },
                            axisLabel: {
                                color: '#666666',
                                formatter: {
                                    _custom: {
                                        type: 'function',
                                        display: '<span>ƒ</span> labelFormatter(val)'
                                    }
                                }
                            }

                        }
                    ],
                    grid: [
                        {
                            left: '8%',
                            right: '13%',
                            top: '22%',
                            bottom: '10%'
                        }
                    ],
                    series: [
                        {
                            name: '内存使用量（MB）',
                            // step: 'end',
                            type: 'line',
                            smooth: true,
                            yAxisIndex: 0,
                            encode: {
                                x: 'day',
                                y: 'incre'
                            }
                        }
                        // {
                        //     "name":"第二个",
                        //     "type":"line",
                        //     "smooth":true,
                        //     "yAxisIndex":0,
                        //     "encode":{
                        //         "x":"day",
                        //         "y":"row"
                        //     }
                        // },
                    ]
                });
                echart?.setOption(chartOptions, {notMerge: true});
            }
        }, [options, data, title, theme, i18n.language, echart]);
        // const attachRunColor = (runs: string[]): string[] =>
        //   runs?.map((run, index) => {
        //       const i = index % color.length;
        //       return  {

        //       }
        // });
        return (
            <Wrapper ref={wrapper} className={className}>
                {!echart && (
                    <div className="loading">
                        <GridLoader color={primaryColor} size="10px" />
                    </div>
                )}
                <div className="echarts" ref={echartRef}></div>
            </Wrapper>
        );
    }
);

export default DistributedChart;
