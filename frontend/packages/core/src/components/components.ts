import {rem, em, transitionProps,position, size} from '~/utils/style';
import styled from 'styled-components';
import Icon from '~/components/Icon';
import logo from '~/assets/images/question-circle.svg';
import hover from '~/assets/images/hover.svg';
export const Configure = styled.div`
    margin-top: ${rem(30)};
    width: 100%;
    font-family: PingFangSC-Medium;
    font-size: ${rem(16)};
    color: #333333;
    font-weight: 500;
    padding-left: ${rem(20)};
    padding-right: ${rem(20)};
    .title {
        display: flex;
        align-items: center;
        margin-bottom: ${rem(20)};
        div {
            line-height: 18px;
        }
        
    }
`;
export const ArgumentOperation = styled.a`
    flex: none;
    cursor: pointer;
    font-size: ${em(14)};
    margin-left: ${em(10)};
    color: var(--text-lighter-color);
    ${transitionProps('color')}
    &:hover,
    &:active {
        color: #2932e1;
    }
    img {
        width: 16px;
        height: 16px;
    }
    img:hover {
        content: url(${hover});
    }
`;
export const ButtonsRight = styled.div`
    border: 1px solid #dddddd;
    border-radius: 0 4px 4px 0;
    width: ${rem(110)};
    height: ${rem(36)};
    font-family: PingFangSC-Regular;
    font-size: ${rem(12)};
    text-align: center;
    line-height: ${rem(36)};
    font-weight: 400;
`;
export const ButtonsLeft = styled.div`
    border: 1px solid #dddddd;
    width: ${rem(110)};
    height: ${rem(36)};
    font-family: PingFangSC-Regular;
    font-size: ${rem(12)};
    text-align: center;
    line-height: ${rem(36)};
    font-weight: 400;
    border-radius: 4px 0 0 4px;
`;
export const RadioButtons = styled.div`
    display: flex;
    align-items: center;
    border-radius: 4px;
    margin-left:20px;
    .is_active {
        color: #ffffff;
        background: #2932e1;
        border: 1px solid rgba(41, 50, 225, 1);
    }
`;
export const Wraper = styled.div`
    width: 100%;
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
            text-align:right;
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