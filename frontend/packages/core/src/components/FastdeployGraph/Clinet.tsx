import React, {FunctionComponent} from 'react';
import {useTranslation} from 'react-i18next';
const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;
// type ArgumentProps = {

// };
console.log('PUBLIC_PATH', PUBLIC_PATH, PUBLIC_PATH + '/api/fastdeploy/fastdeploy_client');

const ServerBox: FunctionComponent = () => {
    // const {t} = useTranslation(['Fastdeploy']);
    const {i18n} = useTranslation(['Fastdeploy']);
    const language: string = i18n.language;
    return (
        <div
            style={{
                width: '100%',
                height: '100%'
            }}
        >
            <iframe
                style={{
                    width: '100%',
                    height: '100%'
                }}
                src={PUBLIC_PATH + `/api/fastdeploy/fastdeploy_client?lang=${language}`}
                // src={'https://www.baidu.com/'}
                frameBorder={0}
                scrolling="true"
                marginWidth={0}
                marginHeight={0}
            ></iframe>
        </div>
    );
};

export default ServerBox;
