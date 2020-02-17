import {createComponent, reactive} from '@vue/composition-api';
import i18next from 'i18next';
import capitalize from 'lodash/capitalize';

export default createComponent({
    head() {
        return {
            title: capitalize(i18next.t('global.metrics'))
        };
    },

    setup(_props, {root: {$i18n}}) {
        const data = reactive({
            count: 0
        });
        return () => (
            <div>
                <p>{$i18n.t('global.metrics')}</p>
                <p>{data.count}</p>
            </div>
        );
    }
});
