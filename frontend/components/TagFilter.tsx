import React, {FunctionComponent, useState, useCallback, useEffect, useMemo} from 'react';
import styled from 'styled-components';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import {useTranslation} from '~/utils/i18n';
import {rem, math, ellipsis} from '~/utils/style';
import SearchInput from '~/components/SearchInput';
import Tag from '~/components/Tag';
import {Tag as TagType} from '~/types';

const margin = rem(16);

const Wrapper = styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
`;

const Search = styled(SearchInput)`
    width: ${rem(280)};
    margin: 0 ${math(`${rem(5)} + ${margin}`)} ${margin} 0;
`;

const SearchTag = styled(Tag)`
    margin: 0 ${margin} ${margin} 0;
    vertical-align: middle;
`;

const SearchTagLabel = styled.span`
    ${ellipsis(rem(120))}
    vertical-align: middle;
`;

type TagFilterProps = {
    value?: string;
    tags?: TagType[];
    onChange?: (value: TagType[]) => unknown;
};

const TagFilter: FunctionComponent<TagFilterProps> = ({value, tags: propTags, onChange}) => {
    type NonNullTags = NonNullable<typeof propTags>;

    const {t} = useTranslation('common');

    const tagGroups = useMemo(
        () =>
            sortBy(
                Object.entries(groupBy<TagType>(propTags || [], tag => tag.label.split('/')[0])).map(
                    ([label, tags]) => ({
                        label,
                        tags
                    })
                ),
                tag => tag.label
            ),
        [propTags]
    );

    const [matchedCount, setMatchedCount] = useState(propTags?.length ?? 0);
    useEffect(() => setMatchedCount(propTags?.length ?? 0), [propTags, setMatchedCount]);

    const [inputValue, setInputValue] = useState(value || '');
    useEffect(() => setInputValue(value || ''), [value, setInputValue]);

    const [selectedValue, setSelectedValue] = useState('');
    const hasSelectedValue = useMemo(() => selectedValue !== '', [selectedValue]);
    const allText = useMemo(() => inputValue || t('all'), [inputValue, t]);

    const onInputChange = useCallback(
        (value: string) => {
            setInputValue(value);
            setSelectedValue('');
            try {
                const pattern = new RegExp(value);
                const matchedTags = propTags?.filter(tag => pattern.test(tag.label)) ?? [];
                setMatchedCount(matchedTags.length);
                onChange?.(matchedTags);
            } catch {
                setMatchedCount(0);
            }
        },
        [propTags, onChange]
    );
    const onClickTag = useCallback(
        ({label, tags}: {label: string; tags: NonNullTags}) => {
            setSelectedValue(label);
            onChange?.(tags);
        },
        [onChange]
    );
    const onClickAllTag = useCallback(() => {
        setSelectedValue('');
        onInputChange(inputValue);
    }, [inputValue, onInputChange]);

    return (
        <Wrapper>
            <Search placeholder={t('searchTagPlaceholder')} rounded onChange={onInputChange}></Search>
            <SearchTag active={!hasSelectedValue} onClick={onClickAllTag} title={allText}>
                <SearchTagLabel>{allText}</SearchTagLabel> ({inputValue ? matchedCount : propTags?.length ?? 0})
            </SearchTag>
            {tagGroups.map(group => (
                <SearchTag
                    active={hasSelectedValue && group.label === selectedValue}
                    onClick={() => onClickTag(group)}
                    key={group.label}
                    title={group.label}
                >
                    <SearchTagLabel>{group.label}</SearchTagLabel> ({group.tags.length})
                </SearchTag>
            ))}
        </Wrapper>
    );
};

TagFilter.defaultProps = {
    tags: [] as TagType[]
};

export default TagFilter;
