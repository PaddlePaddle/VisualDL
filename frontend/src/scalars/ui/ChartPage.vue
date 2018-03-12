<template>
    <div class="visual-dl-chart-page">
        <ui-expand-panel :info="tagList.length" :title="title">
            <div ref="chartPageBox" class="visual-dl-chart-page-box">
                <ui-chart
                    v-for="(tagInfo, index) in filteredTagList"
                    :key="index"
                    :tagInfo="tagInfo"
                    :groupNameReg="config.groupNameReg"
                    :smoothing="config.smoothing"
                    :horizontal="config.horizontal"
                    :sortingMethod="config.sortingMethod"
                    :outlier="config.outlier"
                    :runs="config.runs"
                    :running="config.running"
                    :runsItems="runsItems"
                ></ui-chart>
            </div>
            <v-pagination
                v-if="total > pageSize"
                v-model="currentPage"
                :length="pageLength"
            />
        </ui-expand-panel>
    </div>
</template>
<script>
import ExpandPanel from '../../common/component/ExpandPanel';
import Chart from './Chart';
import {cloneDeep} from 'lodash';

export default {
    components: {
        'ui-chart': Chart,
        'ui-expand-panel': ExpandPanel,
        // 'ui-pagination': Pagination
    },
    props: ['config', 'runsItems', 'tagList', 'title'],
    computed: {
        filteredRunsList() {
            let tagList = this.tagList || [];
            let runs = this.config.runs || [];
            let list = cloneDeep(tagList);
            return list.slice().map(item => {
                item.tagList = item.tagList.filter(one => runs.includes(one.run));
                return item;
            });
        },
        filteredTagList() {
            let tagList = this.filteredRunsList || [];
            return  tagList.slice((this.currentPage - 1) * this.pageSize, this.currentPage * this.pageSize);
        },
        total() {
            let tagList = this.tagList || [];
            return tagList.length;
        },
        pageLength() {
            return Math.ceil(this.total / this.pageSize)
        }
    },
    data() {
        return {
            // current page
            currentPage: 1,
            // item per page
            pageSize: 8
        };
    }
};
</script>
<style lang="stylus">
@import '~style/variables';

+prefix-classes('visual-dl-')
    .chart-page
        .chart-page-box:after
            content: "";
            clear: both;
            display: block;
            padding-bottom: 2%
</style>


