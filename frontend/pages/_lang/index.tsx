import {createComponent} from '@vue/composition-api';

export default createComponent({
    fetch({redirect, route}) {
        redirect({name: 'lang-metrics', params: route.params, query: route.query, hash: route.hash});
    }
});
