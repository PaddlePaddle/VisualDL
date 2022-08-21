import {rem, em, transitionProps, position, size} from '~/utils/style';
import styled from 'styled-components';
import type {SelectProps} from '~/components/Select';
const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;
import Select from '~/components/Select';
import Icon from '~/components/Icon';
import logo from '~/assets/images/question-circle.svg';
import hover from '~/assets/images/hover.svg';
export const color = [
    '#2932E1',
    '#00CC88',
    '#981EFF',
    '#066BFF',
    '#00E2FF',
    '#FFAA00',
    '#E71ED5',
    '#FF6600',
    '#0DEBB0',
    '#D50505'
];
export const color2 = ['#2932E1', '#00CC88', '#981EFF', '#FF6D6D', '#25C9FF', '#E71ED5', '#FFAA00', '#00307D'];
export const Configure = styled.div`
    margin-top: ${rem(30)};
    width: 100%;
    font-family: PingFangSC-Medium;
    font-size: 16px;
    color: #333333;
    font-weight: 500;
    padding-left: ${rem(20)};
    padding-right: ${rem(20)};
    .titleContent {
        display: flex;
        justify-content: space-between;
        .title {
            display: flex;
            align-items: center;
            // div {
            //     line-height: 16px;
            // }
        }
        .titles {
            display: flex;
            align-items: center;
            margin-bottom: ${rem(15)};
        }
        .searchContent {
            display: flex;
            .input_wrapper {
                width: auto;
                height: ${rem(36)};
                .ant-input-group-wrapper {
                    height: 100%;
                    width: 100%;
                    .ant-input-wrapper {
                        height: 100%;
                        .ant-input {
                            height: 100%;
                        }
                        .ant-btn {
                            height: 100%;
                        }
                    }
                    .ant-btn {
                        border-left: none;
                    }
                }
            }
            .select_label {
                margin-right: ${rem(15)};
                line-height: ${rem(36)};
            }
            .select_wrapper {
                width: auto;
                height: ${rem(36)};
                align-items: center;
                margin-right: ${rem(15)};
                .ant-select {
                    border-radius: ${rem(4)};
                    height: 100%;
                    .ant-select-selector {
                        height: 100%;
                    }
                }
            }
        }
        .bold {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
                'Fira Sans', 'Droid Sans', 'Helvetica Neue';
            font-size: 14px;
            font-weight: 500;
            color: #333333;
            margin-bottom: ${rem(10)};
        }
        .indent {
            text-indent: 2em;
            margin-bottom: ${rem(10)};
        }
        .tooltipsContent {
            width: ${rem(500)};
        }
    }
    .preline {
        white-space: pre-line;
        white-space: pre-wrap;
    }
`;
export const ArgumentOperation = styled.a`
    flex: none;
    cursor: pointer;
    font-size: 14px;
    margin-left: ${rem(8)};
    color: var(--text-lighter-color);
    ${transitionProps('color')}
    &:hover,
    &:active {
        color: #2932e1;
    }
    img {
        width: 14px;
        height: 14px;
    }
    img:hover {
        content: url(${`${PUBLIC_PATH}/images/hover.svg`});
    }
    display: flex;
    align-items: center;
`;
export const ButtonsRight = styled.div`
    border: 1px solid #dddddd;
    border-radius: 0 4px 4px 0;
    width: ${rem(110)};
    height: ${rem(36)};
    font-family: PingFangSC-Regular;
    font-size: 14px;
    text-align: center;
    line-height: ${rem(36)};
    font-weight: 400;
`;
export const ButtonsLeft = styled.div`
    border: 1px solid #dddddd;
    width: ${rem(110)};
    height: ${rem(36)};
    font-family: PingFangSC-Regular;
    font-size: 14px;
    text-align: center;
    line-height: ${rem(36)};
    font-weight: 400;
    border-radius: 4px 0 0 4px;
`;
export const RadioButtons = styled.div`
    display: flex;
    align-items: center;
    border-radius: 4px;
    margin-left: ${rem(20)};
    .is_active {
        color: #ffffff;
        background: #2932e1;
        border: 1px solid rgba(41, 50, 225, 1);
    }
`;
export const Wraper = styled.div`
    width: 100%;
    min-height: ${rem(400)};
    position: relative;
    .ant-table.ant-table-bordered > .ant-table-container > .ant-table-header > table > thead > tr > th {
        background: #f3f8fe;
    }
    .ant-table-pagination.ant-pagination {
        margin: ${rem(20)} 0;
        padding-right: ${rem(20)};
    }
    .ant-table.ant-table-bordered > .ant-table-container {
        border: 1px solid #dddddd;
        border-radius: 8px;
    }
    .ant-table.ant-table-bordered > .ant-table-container > .ant-table-body > table > tbody .ant-table-row-level-1 {
        background: #f0f0f0;
        > td {
            border: 1px solid #dddddd;
            border-left: none;
            border-top: none;
        }
    }
    .ant-table-row-level-1 {
        div {
            text-align: right;
        }
    }
    .whiteWrap {
        margin-left: 25px;
    }
    > .loading {
        ${size('100%')}
        ${position('absolute', 0, null, null, 0)}
        display: flex;
        justify-content: center;
        align-items: center;
    }
`;
export const EchartPie = styled.div`
    width: 100%;
    height: ${rem(270)};
    display: flex;
    .wraper {
        flex: 1;
        .Content {
            height: 100%;
        }
    }
    .Content {
        height: 100%;
        width: 100%;
    }
    .ant-radio-inner {
        background-color: #fff;
        border-color: #ffffff;
        border-style: solid;
        border-width: 2px;
        border-radius: 50%;
    }
    .tooltipContent {
        padding-right: ${rem(30)};
        .tooltipitems {
            display: flex;
            align-items: center;
        }
    }
`;
export const FullWidthSelect = styled<React.FunctionComponent<SelectProps<any>>>(Select)`
    width: 100%;
    height: 100%;
    font-size: 14px;
`;
export const ViewWrapper = styled.div`
    width: 100%;
    height: 100%;
    flex-grow: 1;
    position: relative;
    background-color: #fff;
`;
export const TableContent = styled.div`
    min-height: ${rem(200)};
    position: relative;
    .ant-table.ant-table-bordered > .ant-table-container > .ant-table-header > table > thead > tr > th {
        background: #f3f8fe;
        border-right: 1px solid #dddddd;
        border-bottom: 1px solid #dddddd;
    }
    .ant-table.ant-table-bordered > .ant-table-container > .ant-table-content > table > thead > tr > th {
        background: #f3f8fe;
        border-right: 1px solid #dddddd;
        border-bottom: 1px solid #dddddd;
    }
    .ant-table.ant-table-bordered > .ant-table-container > .ant-table-body > table > tbody > tr > td {
        border-right: 1px solid #dddddd;
        border-bottom: 1px solid #dddddd;
    }
    .ant-table.ant-table-bordered > .ant-table-container > .ant-table-content > table > tbody > tr > td {
        border-right: 1px solid #dddddd;
        border-bottom: 1px solid #dddddd;
    }
    .ant-table.ant-table-bordered > .ant-table-container {
        border: 1px solid #dddddd;
        border-radius: ${rem(8)};
    }
    > .loading {
        ${size('100%')}
        ${position('absolute', 0, null, null, 0)}
    display: flex;
        justify-content: center;
        align-items: center;
    }
`;
export const PieceContent = styled.div`
    border: 1px solid #dddddd;
    border-radius: ${rem(4)};
    width: 100%;
    height: auto;
    // padding-bottom: ${rem(20)};
    .expendContent {
        display: flex;
        align-items: center;
        .expendButton {
            color: #a3a3a3;
            margin-left: ${rem(20)};
            margin-right: ${rem(10)};
        }
        margin-bottom: ${rem(20)};
    }
`;
export const Subtraction = styled.div<{disable: boolean}>`
    width: ${rem(32)};
    height: ${rem(32)};
    font-size: 16px;
    line-height: ${rem(32)};
    text-align: center;
    border: 1px solid #e0e0e0;
    border-left: none;
    &:hover {
        cursor: ${props => (props.disable ? 'auto' : 'not-allowed')};
    }
`;
export const RadioContent = styled.div`
    display: flex;
    align-items: center;
    padding-right: ${rem(20)};
    .ant-radio-group {
        display: flex;
    }
    .ant-radio-wrapper {
        span {
            white-space: nowrap;
        }
        .ant-radio-checked .ant-radio-inner {
            border-color: #2932e1;
        }
        .ant-radio-inner::after {
            background-color: #2932e1;
        }
    }
    .AdditionContent {
        display: flex;
        align-items: center;
        .input_wrapper {
            width: ${rem(50)};
            height: ${rem(32)};
        }
        .Addition {
            width: ${rem(32)};
            height: ${rem(32)};
            line-height: ${rem(32)};
            font-size: 16px;
            text-align: center;
            border: 1px solid #e0e0e0;
            border-right: none;
        }
    }
`;
export const Title = styled.div`
    width: 100%;
    height: ${rem(50)};
    font-family: PingFangSC-Medium;
    font-size: 16px;
    color: #333333;
    line-height: ${rem(50)};
    font-weight: 500;
    padding-left: ${rem(20)};
    border-bottom: 1px solid #dddddd;
    margin-bottom: ${rem(20)};
`;
