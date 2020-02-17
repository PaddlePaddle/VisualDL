import {createComponent} from '@vue/composition-api';

export default createComponent({
    fetch({redirect, route}) {
        redirect({
            name: route.params.lang ? 'lang-metrics' : 'metrics',
            params: route.params,
            query: route.query,
            hash: route.hash
        });
    }
});
