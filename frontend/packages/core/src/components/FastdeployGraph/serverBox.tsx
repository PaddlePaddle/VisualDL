import React, {FunctionComponent} from 'react';
import styled from 'styled-components';
import {rem} from '~/utils/style';
const Buttons = styled.div`
    height: ${rem(36)};
    line-height: ${rem(36)};
    text-align: center;
    font-size: 16px;
    margin-left: 20px;
    width: 100px;
    color: white;
    background-color: var(--navbar-background-color);
`;
const ButtonContent = styled.div`
    display: flex;
    justify-content: flex-end;
    padding-top: 20px;
    padding-bottom: 20px;
`;
type ArgumentProps = {
    Datas: any;
    updatdDatas?: any;
};
const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;
// type ArgumentProps = {

// };
console.log('PUBLIC_PATH', PUBLIC_PATH, PUBLIC_PATH + '/api/fastdeploy/fastdeploy_client');
const serverBox: FunctionComponent<ArgumentProps> = ({Datas, updatdDatas}) => {
    console.log('Datas', Datas);

    return (
        <div>
            <div
                style={{
                    whiteSpace: 'pre-wrap',
                    background: 'black',
                    color: 'white',
                    padding: '20px',
                    height: '650px',
                    overflowY: 'auto'
                }}
            >
                {Datas}
            </div>
            <ButtonContent>
                <Buttons
                    onClick={() => {
                        const url = PUBLIC_PATH + '/api/fastdeploy/fastdeploy_client';
                        window.open(url);
                    }}
                >
                    打开客户端
                </Buttons>
                <Buttons
                    onClick={() => {
                        updatdDatas();
                    }}
                >
                    更新日志
                </Buttons>
            </ButtonContent>
        </div>
    );
};

export default serverBox;
