import {createComponent, reactive} from '@vue/composition-api';

export default createComponent({
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
