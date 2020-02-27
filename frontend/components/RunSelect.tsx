import React, {FunctionComponent} from 'react';
import styled from 'styled-components';
import {rem} from '~/utils/style';
import {useTranslation} from '~/utils/i18n';
import Select, {SelectValueType} from '~/components/Select';

const Title = styled.h3`
    font-size: ${rem(16)};
    line-height: ${rem(16)};
    margin-bottom: ${rem(10)};
`;

type RunSelectProps = {
    runs?: string[];
    value?: string[];
    onChange?: (value: string[]) => unknown;
};

const RunSelect: FunctionComponent<RunSelectProps> = ({runs, value, onChange}) => {
    const {t} = useTranslation('common');

    return (
        <>
            <Title>{t('select-runs')}</Title>
            <Select
                multiple
                list={runs}
                value={value}
                onChange={(value: SelectValueType | SelectValueType[]) => onChange?.(value as string[])}
            />
        </>
    );
};

export default RunSelect;
