import React, {FunctionComponent} from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {WithStyled, backgroundColor, em, link, rem, size, textColor, textLightColor} from '~/utils/style';

import styled from 'styled-components';

const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;

const Wrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${backgroundColor};
    height: 100%;
    width: 100%;

    > .image {
        background-image: url(${`${PUBLIC_PATH}/images/empty.svg`});
        background-repeat: no-repeat;
        background-position: center center;
        background-size: 100% 100%;
        ${size(rem(244), rem(280))}
    }

    > .inner {
        width: calc(50% - ${rem(280)});
        color: ${textLightColor};
        ${link}

        h4 {
            color: ${textColor};
            font-size: ${em(18)};
            font-weight: 700;
        }

        p {
            margin: 0;
        }

        ol {
            padding-left: 2em;
            line-height: 1.857142857;
        }
    }
`;

const reload = () => window.location.reload();

const ReadmeMap: Record<string, string> = {
    zh: 'https://github.com/PaddlePaddle/VisualDL/blob/develop/README.md',
    en: 'https://github.com/PaddlePaddle/VisualDL/blob/develop/README-en.md'
};

const UserGuideMap: Record<string, string> = {
    zh: 'https://github.com/PaddlePaddle/VisualDL/blob/develop/docs/components/README.md',
    en: 'https://github.com/PaddlePaddle/VisualDL/blob/develop/docs/components/UserGuide-en.md'
};

const I18nLink: FunctionComponent<{map: Record<string, string>}> = ({map, children}) => {
    const {i18n} = useTranslation();
    return (
        <a
            href={map[i18n.language] ?? map[String(i18n.options.fallbackLng)] ?? map.en}
            target="_blank"
            rel="noreferrer"
        >
            {children}
        </a>
    );
};

const Error: FunctionComponent<WithStyled> = ({className, children}) => {
    const {t} = useTranslation('errors');

    return (
        <Wrapper className={className}>
            <div className="image"></div>
            <div className="inner">
                {children || (
                    <>
                        <h4>{t('errors:common.title')}</h4>
                        <p>{t('errors:common.description')}</p>
                        <ol>
                            <li>
                                <Trans i18nKey="errors:common.1">
                                    Log files are not generated. Please refer to&nbsp;
                                    <I18nLink map={ReadmeMap}>README</I18nLink>
                                    &nbsp;to create log files.
                                </Trans>
                            </li>
                            <li>
                                <Trans i18nKey="errors:common.2">
                                    Log files are generated but data is not written yet. Please refer to&nbsp;
                                    <I18nLink map={UserGuideMap}>VisualDL User Guide</I18nLink>
                                    &nbsp;to write visualized data.
                                </Trans>
                            </li>
                            <li>
                                <Trans i18nKey="errors:common.3">
                                    Log files are generated and data is writte. Please try to&nbsp;
                                    <a onClick={reload}>Refresh</a>.
                                </Trans>
                            </li>
                            <li>
                                <Trans i18nKey="errors:common.4">
                                    Log files are generated but path to log directory is wrong. Please check your
                                    directory and try again.
                                </Trans>
                            </li>
                        </ol>
                    </>
                )}
            </div>
        </Wrapper>
    );
};

export default Error;
