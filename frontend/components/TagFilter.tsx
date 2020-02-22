import React, {FunctionComponent, useState} from 'react';
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
    const {t} = useTranslation('common');

    const tagGroups = sortBy(
        Object.entries(groupBy<TagType>(propTags || [], tag => tag.label.split('/')[0])).map(([label, tags]) => ({
            label,
            tags
        })),
        tag => tag.label
    );

    const [matchedCount, setMatchedCount] = useState(propTags?.length ?? 0);
    const [inputValue, setInputValue] = useState(value || '');
    const [selectedValue, setSelectedValue] = useState('');
    const hasSelectedValue = selectedValue !== '';
    const allText = inputValue || t('all');

    const onInputChange = (value: string) => {
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
    };
    const onClickTag = ({label, tags}: {label: string; tags: NonNullable<typeof propTags>}) => {
        setSelectedValue(label);
        onChange?.(tags);
    };
    const onClickAllTag = () => {
        setSelectedValue('');
        onInputChange(inputValue);
    };

    return (
        <Wrapper>
            <Search placeholder={t('searchTagPlaceholder')} rounded onChange={onInputChange}></Search>
            <SearchTag active={!hasSelectedValue} onClick={onClickAllTag} title={allText}>
                <SearchTagLabel>{allText}</SearchTagLabel> ({matchedCount})
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
