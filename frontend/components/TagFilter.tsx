import React, {FunctionComponent, useState} from 'react';
import {useTranslation} from '~/utils/i18n';
import {styled, rem, math, ellipsis} from '~/utils/style';
import {Tag as TagType} from '~/types';
import SearchInput from '~/components/SearchInput';
import Tag from '~/components/Tag';

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
    total?: number;
    tags?: TagType[];
    onChange?: (value: string) => unknown;
};

const TagFilter: FunctionComponent<TagFilterProps> = ({tags, total, onChange}) => {
    const {t} = useTranslation('common');

    const [inputValue, setInputValue] = useState('');
    const [selectedValue, setSelectedValue] = useState('');
    const hasSelectedValue = selectedValue !== '';
    const allText = inputValue || t('all');

    const onInputChange = (value: string) => {
        setInputValue(value);
        setSelectedValue('');
        onChange?.(value);
    };
    const onClickTag = (value: string) => {
        setSelectedValue(value);
        onChange?.(value);
    };
    const onClickAllTag = () => {
        setSelectedValue('');
        onChange?.(inputValue);
    };

    return (
        <Wrapper>
            <Search placeholder={t('searchTagPlaceholder')} rounded onChange={onInputChange}></Search>
            <SearchTag active={!hasSelectedValue} onClick={onClickAllTag} title={allText}>
                <SearchTagLabel>{allText}</SearchTagLabel> ({total})
            </SearchTag>
            {tags?.map((tag, index) => (
                <SearchTag
                    active={hasSelectedValue && tag.label === selectedValue}
                    onClick={() => onClickTag(tag.label)}
                    key={index}
                    title={tag.label}
                >
                    <SearchTagLabel>{tag.label}</SearchTagLabel> ({tag.count})
                </SearchTag>
            ))}
        </Wrapper>
    );
};

TagFilter.defaultProps = {
    total: 0,
    tags: [] as TagType[]
};

export default TagFilter;
