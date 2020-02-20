import React from 'react';
import {WithTranslation} from 'next-i18next';
import capitalize from 'lodash/capitalize';
import {withTranslation} from '~/utils/i18n';
import {styled, rem, math} from '~/utils/style';
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
`;

type TagFilterProps = {
    total?: number;
    tags?: TagType[];
    onChange?: (value: string) => unknown;
};

class TagFilter extends React.Component<TagFilterProps & WithTranslation> {
    static defaultProps = {
        total: 0,
        tags: [] as TagType[]
    };

    state = {
        inputValue: '',
        selectedValue: ''
    };

    onInputChange = (value: string) => {
        this.setState({inputValue: value, selectedValue: ''});
        this.props.onChange?.(value);
    };

    onClickTag = (value: string) => {
        this.setState({selectedValue: value});
        this.props.onChange?.(value);
    };

    onClickAllTag = () => {
        this.setState({selectedValue: ''});
        this.props.onChange?.(this.state.inputValue);
    };

    render() {
        const {tags, total, t} = this.props;
        const {inputValue, selectedValue} = this.state;

        const hasSelectedValue = selectedValue !== '';

        const allText = inputValue || `${capitalize(t('all'))}`;

        return (
            <Wrapper>
                <Search placeholder={t('searchTagPlaceholder')} rounded onChange={this.onInputChange}></Search>
                <SearchTag active={!hasSelectedValue} onClick={this.onClickAllTag}>
                    {allText} ({total})
                </SearchTag>
                {tags?.map((tag, index) => (
                    <SearchTag
                        active={hasSelectedValue && tag.label === selectedValue}
                        onClick={() => this.onClickTag(tag.label)}
                        key={index}
                    >
                        {tag.label} ({tag.count})
                    </SearchTag>
                ))}
            </Wrapper>
        );
    }
}

export default withTranslation('common')(TagFilter);
