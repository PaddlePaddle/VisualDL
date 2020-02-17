import {createComponent} from '@vue/composition-api';

export default createComponent({
    fetch({redirect, route, app}) {
        redirect({
            name: `${app.$accessor.locale}__metrics`,
            params: route.params,
            query: route.query,
            hash: route.hash
        });
    }
});
