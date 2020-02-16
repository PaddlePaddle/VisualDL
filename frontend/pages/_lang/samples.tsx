import {createComponent, reactive} from '@vue/composition-api';

export default createComponent({
    setup(props, {root: {$i18n}}) {
        const data = reactive({
            count: 0
        });
        setInterval(() => data.count++, 1000);
        return () => (
            <div>
                <p>{$i18n.t('global.samples')}</p>
                <p>{data.count}</p>
            </div>
        );
    }
});
