import React, {FunctionComponent} from 'react';
import {rem, size} from '~/utils/style';

import type {Run} from '~/types';
import styled from 'styled-components';

const Wrapper = styled.div`
    max-height: ${rem(160)};
    overflow: hidden auto;
    overscroll-behavior: auto contain;

    table {
        border-spacing: none;
        text-align: left;
        table-layout: fixed;
        font-size: ${rem(12)};

        th,
        td {
            margin: 0;

            > span {
                display: inline-block;
            }
        }

        th {
            font-size: 1.166666667em;
            font-weight: bold;
            padding: 0 0.285714286em;

            &.run > span {
                min-width: 4.285714286em;
                max-width: 12.857142857em;
            }
        }

        td {
            padding: 0 0.333333333em;

            &.run-indicator > span {
                ${size(12, 12)}
                border-radius: 6px;
                vertical-align: middle;
                background-color: currentColor;
            }
        }
    }
`;

type TooltipTableProps = {
    run: string;
    runs: Run[];
    columns: {
        label: string;
        width?: string;
    }[];
    data?: (string | number)[][];
};

const TooltipTable: FunctionComponent<TooltipTableProps> = ({run, runs, columns, data}) => {
    // CANNOT use translation here
    // because we use `ReactDOMServer.renderToStaticMarkup` to render this component into echarts tooltip
    // `ReactDOMServer.renderToStaticMarkup` WILL NOT call hydrate so translation will never be initialized
    // const {t} = useTranslation('common');

    return (
        <Wrapper>
            <table>
                <thead>
                    <tr>
                        <th className="run-indicator"></th>
                        <th className="run">{run}</th>
                        {columns.map((column, i) => (
                            <th key={i}>
                                <span style={{width: column.width ?? 'auto'}}>{column.label}</span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data?.map((row, j) => (
                        <tr key={j}>
                            <td className="run-indicator">
                                <span style={{color: runs[j]?.colors[0]}}></span>
                            </td>
                            <td className="run">
                                <span>{runs[j]?.label}</span>
                            </td>
                            {row.map((cell, k) => (
                                <td key={k}>
                                    <span>{cell}</span>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </Wrapper>
    );
};

export default TooltipTable;
