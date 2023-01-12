import React, {useState} from 'react';
import {rem, primaryColor, size} from '~/utils/style';
import {Tabs} from 'antd';
import Content from '~/components/Content';
import Clinet from '~/components//FastdeployGraph/Clinet';
import {fetcher} from '~/utils/fetch';
import HashLoader from 'react-spinners/HashLoader';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

// import {useTranslation} from 'react-i18next';

const Contents = styled.div`
    height: 100%;
    background: white;
    display: flex;
    flex-direction: column;
`;
const Loading = styled.div`
    ${size('100%', '100%')}
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overscroll-behavior: none;
    cursor: progress;
    font-size: ${rem(16)};
    line-height: ${rem(60)};
`;
const TabsContent = styled.div`
    padding: 20px 10px 0px 10px;
    flex: 1;
    .ant-tabs-content-left {
        height: 100%;
    }
`;
function App() {
    const [loading, setLoading] = useState(false);
    const [serverModels, setServerModels] = useState<any>([0]);
    const {i18n} = useTranslation(['Fastdeploy']);
    const language: string = i18n.language;
    const getClient = () => {
        fetcher(`/fastdeploy/fastdeploy_client?lang=${language}`, {
            method: 'GET'
        }).then(
            (res: any) => {
                console.log('res', res);
                const serverModel = [...serverModels];
                if (serverModel.length === 0) {
                    serverModel.push(0);
                } else {
                    const last = serverModel[serverModels.length - 1] + 1;
                    serverModel.push(last);
                }
                setServerModels(serverModel);
                setLoading(false);
            },
            res => {
                console.log('errres', res);
                setLoading(false);
            }
        );
    };

    const onEdit: any = (targetKey: string, action: 'add' | 'remove') => {
        if (action === 'add') {
            getClient();
        } else {
            // stopSever(targetKey);
            console.log('targetKey', targetKey);
            const newServerModel: any[] = [];
            for (const model of serverModels) {
                const models = model + '';
                if (models !== targetKey) {
                    newServerModel.push(model);
                }
            }
            setServerModels(newServerModel);
        }
    };
    console.log('serverModels', serverModels);

    return (
        <Content>
            {loading && (
                <Loading>
                    <HashLoader size="60px" color={primaryColor} />
                </Loading>
            )}
            <Contents>
                <TabsContent>
                    <Tabs
                        defaultActiveKey="1"
                        type="editable-card"
                        onEdit={onEdit}
                        tabPosition={'left'}
                        style={{height: '100%'}}
                    >
                        {serverModels.map((server: any) => {
                            return (
                                <Tabs.TabPane tab={`Client${server}`} key={server} style={{height: '100%'}}>
                                    <Clinet></Clinet>
                                </Tabs.TabPane>
                            );
                        })}
                    </Tabs>
                </TabsContent>
            </Contents>
        </Content>
    );
}
export default App;
