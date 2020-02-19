import {createComponent, watch, ref} from '@vue/composition-api';
import {styled, em, borderColor, borderRadius, duration, easing, darken, math} from '~/plugins/style';

export const padding = em(10);
const height = em(36);

const Input = styled('input', {rounded: Boolean})`
    padding: ${padding};
    height: ${height};
    line-height: ${height};
    display: inline-block;
    width: 100%;
    border: 1px solid ${borderColor};
    border-radius: ${props => (props.rounded ? math(`${height} / 2`) : borderRadius)};
    transition: border-color ${duration} ${easing};
    outline: none;

    &:hover,
    &:focus {
        border-color: ${darken(0.15, borderColor)};
    }

    &::placeholder {
        color: #999;
    }
`;

export default createComponent({
    name: 'Input',
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
        watch(text, value => emit('change', value));

        return () => (
            <Input placeholder={props.placeholder} rounded={props.rounded} v-model={text.value} type="text"></Input>
        );
    }
});
