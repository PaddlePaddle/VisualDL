import {createComponent, ref, computed} from '@vue/composition-api';
import capitalize from 'lodash/capitalize';
import {styled, rem} from '~/plugins/style';
import SearchInput from '~/components/SearchInput';
import Tag from '~/components/Tag';

const margin = rem(16);

const Wrapper = styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
`;

const Search = styled(SearchInput)`
    width: ${rem(280)};
    margin: 0 ${rem(5)} ${margin} 0;
`;

const SearchTag = styled(Tag)`
    margin: 0 0 ${margin} ${margin};
`;

export default createComponent({
    name: 'TagFilter',
    props: {
        placeholder: {
            type: String
        },
        total: {
            type: Number,
            default: 0
        }
    },
    setup(props, {root: {$i18n}}) {
        const defaultAllText = capitalize($i18n.t('global.all'));
        const searchText = ref('');
        const allText = computed(() => searchText.value || defaultAllText);

        const onChange = (value: string) => searchText.value = value;

        return () => (
            <Wrapper>
                <Search placeholder={props.placeholder} rounded value={searchText.value} onChange={onChange}></Search>
                <SearchTag active>
                    {allText.value} ({props.total})
                </SearchTag>
            </Wrapper>
        );
    }
});
