import {createComponent} from '@vue/composition-api';
import {PortalTarget} from 'portal-vue';
import {styled, asideWidth} from '~/plugins/style';

const Aside = styled(PortalTarget.options)`
    width: ${asideWidth};
    background-color: #fff;
    flex-shrink: 0;
    flex-grow: 0;
`;

export default createComponent({
    name: 'Aside',
    setup() {
        return () => <Aside name="aside" tag="aside"></Aside>;
    }
});
