import {createComponent, ref} from '@vue/composition-api';
import {styled, em, math} from '~/plugins/style';
import Input, {padding} from '~/components/Input';
import icon from '~/assets/images/search.svg';

const iconSize = em(16);

const StyledInput = styled(Input)`
    padding-right: ${math(`${iconSize} + ${padding} * 2`)};
`;

const Control = styled.div`
    background-color: #fff;
    position: relative;
`;

const Icon = styled.span`
    background-image: url(${icon});
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
    width: ${iconSize};
    height: ${iconSize};
    position: absolute;
    top: ${padding};
    right: ${padding};
    pointer-events: none;
`;

export default createComponent({
    name: 'SearchInput',
    props: {
        placeholder: {
            type: String
        },
        rounded: {
            type: Boolean,
            default: false
        },
        value: {
            type: String,
            default: ''
        }
    },
    setup(props, {emit}) {
        const text = ref(props.value);
        const onChange = (value: string) => emit('change', value);

        return () => (
            <Control>
                <StyledInput placeholder={props.placeholder} rounded={props.rounded} value={text.value} onChange={onChange}></StyledInput>
                <Icon></Icon>
            </Control>
        );
    }
});
