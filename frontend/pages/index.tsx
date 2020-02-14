import {createComponent} from '@vue/composition-api';

export default createComponent({
    setup() {
        return (): JSX.Element => <div>Hello world!</div>;
    }
});
