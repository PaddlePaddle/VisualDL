import {createComponent, reactive} from '@vue/composition-api';
import i18next from 'i18next';

export default createComponent({
    setup() {
        const data = reactive({
            count: 0
        });
        setInterval(() => data.count++, 1000);
        return () => (
            <div>
                <p>{i18next.t('global.metrics')}</p>
                <p>{data.count}</p>
            </div>
        );
    }
});
