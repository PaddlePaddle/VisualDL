import {createComponent} from '@vue/composition-api';

export default createComponent({
    fetch({redirect}) {
        redirect({name: 'metrics'});
    }
});
