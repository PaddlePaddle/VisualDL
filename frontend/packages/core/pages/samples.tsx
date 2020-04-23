// cSpell:words ungrouped

import {NextI18NextPage, useTranslation} from '~/utils/i18n';
// import React, {useCallback, useMemo, useState} from 'react';
// import {em, rem} from '~/utils/style';

// import ChartPage from '~/components/ChartPage';
// import Checkbox from '~/components/Checkbox';
// import Content from '~/components/Content';
// import Field from '~/components/Field';
// import Icon from '~/components/Icon';
import Preloader from '~/components/Preloader';
// import SampleChart from '~/components/SamplesPage/SampleChart';
import Title from '~/components/Title';
// import {rem} from '~/utils/style';
// import styled from 'styled-components';
// import useTagFilter from '~/hooks/useTagFilter';

// const StyledIcon = styled(Icon)`
//     font-size: ${rem(16)};
//     margin-left: ${em(6)};
//     margin-right: ${em(4)};
//     vertical-align: middle;
// `;

// const CheckboxTitle = styled.span`
//     font-size: ${rem(16)};
//     font-weight: 700;
//     vertical-align: text-top;
// `;

type Item = {
    run: string;
    label: string;
};

const Samples: NextI18NextPage = () => {
    const {t} = useTranslation(['samples', 'common']);

    // const [running, setRunning] = useState(true);

    // const {runs, tags, selectedRuns, selectedTags, onChangeRuns, onFilterTags, loadingRuns, loadingTags} = useTagFilter(
    //     'images',
    //     running
    // );
    // const ungroupedSelectedTags = useMemo(
    //     () =>
    //         selectedTags.reduce<Item[]>((prev, {runs, ...item}) => {
    //             Array.prototype.push.apply(
    //                 prev,
    //                 runs.map(run => ({...item, run}))
    //             );
    //             return prev;
    //         }, []),
    //     [selectedTags]
    // );

    // const [showActualSize, setShowActualSize] = useState(false);

    // const aside = (
    //     <section>
    //         <Checkbox value={showActualSize} onChange={setShowActualSize}>
    //             {t('show-actual-size')}
    //         </Checkbox>
    //     </section>
    // );

    // const withChart = useCallback(
    //     ({run, label}: Item) => <SampleChart run={run} tag={label} fit={!showActualSize} running={running} />,
    //     [showActualSize, running]
    // );

    return (
        <>
            <Preloader url="/runs" />
            <Preloader url="/images/tags" />
            <Title>{t('common:samples')}</Title>
            {/* <Content aside={aside} loading={loadingRuns}>
                <TagFilter tags={tags} onChange={onFilterTags} />
                <ChartPage items={ungroupedSelectedTags} withChart={withChart} loading={loadingRuns || loadingTags} />
            </Content> */}
        </>
    );
};

Samples.getInitialProps = () => ({
    namespacesRequired: ['samples', 'common']
});

export default Samples;
