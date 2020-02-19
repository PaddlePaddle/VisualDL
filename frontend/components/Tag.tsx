import {createComponent} from '@vue/composition-api';
import {styled, em, primaryColor, lightColor, duration, easing, math, darken} from '~/plugins/style';

const height = em(36);

const Span = styled('span', {active: Boolean})`
    padding: 0 ${em(16)};
    height: ${height};
    line-height: ${height};
    display: inline-block;
    border-radius: ${math(`${height} / 2`)};
    transition: color ${duration} ${easing}, background-color ${duration} ${easing};
    color: ${prop => prop.active ? '#FFF' : primaryColor};
    background-color: ${prop => prop.active ? primaryColor : lightColor};
    cursor: pointer;

    &:hover {
        background-color: ${prop => prop.active ? primaryColor : darken(0.03, lightColor)};
    }
`;

export default createComponent({
    name: 'Tag',
    props: {
        active: {
            type: Boolean,
            default: false
        }
    },
    setup(props, {slots}) {
        return () => <Span active={props.active}>
            {slots.default()}
        </Span>;
    }
});
