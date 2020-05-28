import Aside, {AsideSection} from '~/components/Aside';
import Graph, {GraphRef} from '~/components/GraphsPage/Graph';
import {NextI18NextPage, useTranslation} from '~/utils/i18n';
import React, {useCallback, useMemo, useRef, useState} from 'react';

import Button from '~/components/Button';
import Checkbox from '~/components/Checkbox';
import Content from '~/components/Content';
import Field from '~/components/Field';
import ModelPropertiesDialog from '~/components/GraphsPage/ModelPropertiesDialog';
import SearchInput from '~/components/SearchInput';
import Title from '~/components/Title';
import Uploader from '~/components/GraphsPage/Uploader';
import {rem} from '~/utils/style';
import styled from 'styled-components';

const FullWidthButton = styled(Button)`
    width: 100%;
`;

const ExportButtonWrapper = styled.div`
    display: flex;
    justify-content: space-between;

    > * {
        flex: 1 1 auto;

        &:not(:last-child) {
            margin-right: ${rem(20)};
        }
    }
`;

const Graphs: NextI18NextPage = () => {
    const {t} = useTranslation(['graphs', 'common']);

    const graph = useRef<GraphRef>(null);
    const file = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<FileList | null>(null);
    const onClickFile = useCallback(() => {
        if (file.current) {
            file.current.value = '';
            file.current.click();
        }
    }, []);
    const onChangeFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target;
        if (target && target.files && target.files.length) {
            setFiles(target.files);
        }
    }, []);

    const [search, setSearch] = useState('');
    const [showAttributes, setShowAttributes] = useState(false);
    const [showInitializers, setShowInitializers] = useState(true);
    const [showNames, setShowNames] = useState(false);

    const [modelProperties, setModelProperties] = useState(null);

    const bottom = useMemo(
        () => (
            <FullWidthButton type="primary" rounded onClick={onClickFile}>
                {t('graphs:change-model')}
            </FullWidthButton>
        ),
        [t, onClickFile]
    );

    const [rendered, setRendered] = useState(false);

    const aside = useMemo(() => {
        if (!rendered) {
            return null;
        }
        return (
            <Aside bottom={bottom}>
                <AsideSection>
                    <Field>
                        <SearchInput placeholder={t('common:search')} value={search} onChange={setSearch} />
                    </Field>
                </AsideSection>
                <AsideSection>
                    <FullWidthButton onClick={() => graph.current?.showModelProperties()}>
                        {t('graphs:model-properties')}
                    </FullWidthButton>
                </AsideSection>
                <AsideSection>
                    <Field label={t('graphs:display-data')}>
                        <div>
                            <Checkbox value={showAttributes} onChange={setShowAttributes}>
                                {t('graphs:show-attributes')}
                            </Checkbox>
                        </div>
                        <div>
                            <Checkbox value={showInitializers} onChange={setShowInitializers}>
                                {t('graphs:show-initializers')}
                            </Checkbox>
                        </div>
                        <div>
                            <Checkbox value={showNames} onChange={setShowNames}>
                                {t('graphs:show-node-names')}
                            </Checkbox>
                        </div>
                    </Field>
                </AsideSection>
                <AsideSection>
                    <Field label={t('graphs:export-file')}>
                        <ExportButtonWrapper>
                            <Button onClick={() => graph.current?.export('png')}>{t('graphs:export-png')}</Button>
                            <Button onClick={() => graph.current?.export('svg')}>{t('graphs:export-svg')}</Button>
                        </ExportButtonWrapper>
                    </Field>
                </AsideSection>
            </Aside>
        );
    }, [t, bottom, search, showAttributes, showInitializers, showNames, rendered]);

    const uploader = useMemo(() => <Uploader onClickUpload={onClickFile} onDropFiles={setFiles} />, [onClickFile]);

    return (
        <>
            <Title>{t('common:graphs')}</Title>
            <ModelPropertiesDialog properties={modelProperties} onClose={() => setModelProperties(null)} />
            <Content aside={aside}>
                <Graph
                    ref={graph}
                    files={files}
                    uploader={uploader}
                    showAttributes={showAttributes}
                    showInitializers={showInitializers}
                    showNames={showNames}
                    onRendered={() => setRendered(true)}
                    onShowModelProperties={properties => setModelProperties(properties)}
                />
                <input
                    ref={file}
                    type="file"
                    multiple={false}
                    onChange={onChangeFile}
                    style={{
                        display: 'none'
                    }}
                    accept=".onnx, .pb, .meta, .tflite, .lite, .tfl, .bin, .keras, .h5, .hd5, .hdf5, .json, .model, .mar, .params, .param, .armnn, .mnn, .ncnn, .nn, .dnn, .cmf, .mlmodel, .caffemodel, .pbtxt, .prototxt, .pkl, .pt, .pth, .t7, .joblib, .cfg, .xml"
                />
            </Content>
        </>
    );
};

Graphs.getInitialProps = () => ({
    namespacesRequired: ['graphs', 'common']
});

export default Graphs;
