import {createComponent} from '@vue/composition-api';
import i18next from 'i18next';
import capitalize from 'lodash/capitalize';
import TagFilter from '~/components/TagFilter';

export default createComponent({
    head() {
        return {
            title: capitalize(i18next.t('global.metrics'))
        };
    },

    setup(_props, {root: {$i18n}}) {
        return () => (
            <div>
                <TagFilter placeholder={$i18n.t('global.searchTagPlaceholder')}></TagFilter>
            </div>
        );
    }
});
