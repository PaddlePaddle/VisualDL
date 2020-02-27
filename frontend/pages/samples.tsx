import React, {useState, useCallback, useMemo} from 'react';
import styled from 'styled-components';
import {rem, em} from '~/utils/style';
import {useTranslation, NextI18NextPage} from '~/utils/i18n';
import useTagFilter, {
    getInitialProps as getTagFilterInitialProps,
    defaultProps as defaultTagFilterProps,
    Props as TagFilterProps
} from '~/hooks/useTagFilter';
import {withFetcher} from '~/utils/fetch';
import Title from '~/components/Title';
import Content from '~/components/Content';
import RunSelect from '~/components/RunSelect';
import TagFilter from '~/components/TagFilter';
import Icon from '~/components/Icon';
import Field from '~/components/Field';
import Checkbox from '~/components/Checkbox';
import RunningToggle from '~/components/RunningToggle';
import AsideDivider from '~/components/AsideDivider';
import ChartPage from '~/components/ChartPage';
import SampleChart from '~/components/SampleChart';

const StyledIcon = styled(Icon)`
    font-size: ${rem(16)};
    margin-left: ${em(6)};
    margin-right: ${em(4)};
    vertical-align: middle;
`;

const CheckboxTitle = styled.span`
    font-size: ${rem(16)};
    font-weight: 700;
    vertical-align: text-top;
`;

const SubField = styled(Field)`
    margin-left: ${rem(26)};
`;

type Item = {
    run: string;
    label: string;
};

type SamplesProps = TagFilterProps & {};

const Samples: NextI18NextPage<SamplesProps> = ({tags: propTags, runs: propRuns, selectedRuns: propSelectedRuns}) => {
    const {t} = useTranslation(['samples', 'common']);

    const {runs, tags, selectedRuns, selectedTags, onChangeRuns, onFilterTags} = useTagFilter(
        'images',
        propSelectedRuns,
        {
            runs: propRuns,
            tags: propTags
        }
    );
    const ungroupedSelectedTags = useMemo(
        () =>
            selectedTags.reduce((prev, {runs, ...item}) => {
                Array.prototype.push.apply(
                    prev,
                    runs.map(run => ({...item, run}))
                );
                return prev;
            }, [] as Item[]),
        [selectedTags]
    );

    const [showImage, setShowImage] = useState(true);
    // const [showAudio, setShowAudio] = useState(true);
    // const [showText, setShowText] = useState(true);

    const [running, setRunning] = useState(true);

    const aside = (
        <section>
            <RunSelect runs={runs} value={selectedRuns} onChange={onChangeRuns} />
            <AsideDivider />
            <Field>
                <Checkbox value={showImage} onChange={setShowImage} disabled>
                    <StyledIcon type="image" />
                    <CheckboxTitle>{t('image')}</CheckboxTitle>
                </Checkbox>
            </Field>
            {showImage && (
                <SubField>
                    <Checkbox>{t('show-actual-size')}</Checkbox>
                </SubField>
            )}
            {/* <AsideDivider />
            <Field>
                <Checkbox value={showAudio} onChange={setShowAudio}>
                    <StyledIcon type="audio" />
                    <CheckboxTitle>{t('audio')}</CheckboxTitle>
                </Checkbox>
            </Field>
            <AsideDivider />
            <Field>
                <Checkbox value={showText} onChange={setShowText}>
                    <StyledIcon type="text" />
                    <CheckboxTitle>{t('text')}</CheckboxTitle>
                </Checkbox>
            </Field> */}
            <RunningToggle running={running} onToggle={setRunning} />
        </section>
    );

    const withChart = useCallback(({run, label}: Item) => <SampleChart run={run} tag={label} running={running} />, [
        running
    ]);

    return (
        <>
            <Title>{t('common:samples')}</Title>
            <Content aside={aside}>
                <TagFilter tags={tags} onChange={onFilterTags} />
                <ChartPage items={ungroupedSelectedTags} withChart={withChart} />
            </Content>
        </>
    );
};

Samples.defaultProps = {
    ...defaultTagFilterProps
};

Samples.getInitialProps = withFetcher(async (context, fetcher) => {
    return {
        ...(await getTagFilterInitialProps('images', context, fetcher)),
        namespacesRequired: ['samples', 'common']
    };
});

export default Samples;
