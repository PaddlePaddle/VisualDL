<template>
    <div class="visual-dl-chart-page">
        <ui-expand-panel :info="total" :title="title">
            <ui-image
                class="visual-dl-chart-image"
                v-for="tagInfo in filteredPageList"
                :tagInfo="tagInfo"
                :isActualImageSize="config.isActualImageSize"
                :runs="config.runs"
                :running="config.running"
                :runsItems="runsItems"
            ></ui-image>

            <v-pagination v-if="total > pageSize"
                          v-model="currentPage"
                          :length="total"
                          :total-visible="pageSize"
            ></v-pagination>
        </ui-expand-panel>
    </div>
</template>
<script>
import ExpandPanel from '../../common/component/ExpandPanel';
import Image from './Image';
//import Pagination from 'san-mui/Pagination';

import {cloneDeep, flatten} from 'lodash';

export default {
    props: ['config', 'runsItems', 'tagList', 'title'],
    components: {
        'ui-image': Image,
        'ui-expand-panel': ExpandPanel,
        //'ui-pagination': Pagination
    },
    computed: {
        filteredRunsList() {
            let tagList = this.tagList || [];
            let runs = this.config.runs || [];
            let list = cloneDeep(tagList);
            return flatten(list.slice().map(item => {
                return item.tagList.filter(one => runs.includes(one.run));
            }));
        },

        filteredPageList() {
            let list = this.filteredRunsList || [];
            let currentPage = this.currentPage;
            let pageSize = this.pageSize;
            return list.slice((currentPage - 1) * pageSize, currentPage * pageSize);
        },
        total() {
            let list = this.tagList || [];
            return list.length;
        }
    },
    data() {
        return {
            // current page
            currentPage: 1,
            // item per page
            pageSize: 8
        };
    },
};
</script>
<style lang="stylus">
@import '../../style/variables';

+prefix-classes('visual-dl-')
    .chart-page
        .image-chart-box
            overflow hidden
            float left
            .visual-dl-chart-image
                float left
        .image-chart-box:after
            content ""
            clear both
            display block
        .sm-pagination
            height 50px
            float left
            width 100%
</style>


