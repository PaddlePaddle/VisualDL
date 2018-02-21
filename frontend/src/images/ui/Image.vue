<template>
    <div class="visual-dl-image">
        <h3 class="visual-dl-image-title">{{tagInfo.tag.displayName}}
            <span class="visual-dl-image-run-icon">{{tagInfo.run}}</span>
        </h3>
        <p>
            <span>Step:</span>
            <span>{{imgData.step}};</span>
            <span>{{imgData.wall_time | formatTime}}</span>
        </p>
        <!--<san-slider-->
            <!--on-change="handleSlideChange($event)"-->
            <!--value="{{currentIndex}}"-->
            <!--min="{{slider.min}}"-->
            <!--max="{{steps}}"-->
            <!--step="{{1}}"-->
        <!--/>-->
        <img :style="computedImgStyle" :src="imgData.imgSrc" />
    </div>
</template>
<script>
//import Slider from 'san-mui/Slider';
import {getPluginImagesImages} from '../../service';

const defaultImgWidth = 400;
const defaultImgHight = 300;
// the time to refresh chart data
const intervalTime = 30;

export default {
    props: ['tagInfo', 'isActualImageSize', 'runs', 'running', 'runsItems'],
    components: {
        //'san-slider': Slider
    },
    computed: {
        steps() {
            let data = this.data || [];
            return data.length - 1;
        },
        computedImgStyle() {
            let isActualImageSize = this.isActualImageSize;
            let width;
            let height;
            if (isActualImageSize) {
                width = this.imgData.width;
                height = this.imgData.height;
            }
            else {
                width = defaultImgWidth;
                height = defaultImgHight;
            }
            return 'width:' + width + 'px;height:' + height + 'px';
        }
    },
    filters: {
        formatTime: function (value) {
            if (!value) {
                return;
            }
            let time = new Date();
            time.setTime(value.toString().split('.')[0]);
            return time;
        }
    },
    data() {
        return {
            currentIndex: 0,
            slider: {
                value: '0',
                label: '',
                min: 0,
                step: 1
            },
            imgData: {}
        };
    },
    created() {
        this.getOriginChartsData();
    },
    mounted() {
        if (this.running) {
            this.startInterval();
        }
    },

    beforeDestroy() {
        this.stopInterval();
    },

    watch: {
        running: function (val) {
            val ? this.startInterval() : this.stopInterval();
        },
        currentIndex: function(index) {
            console.log("askdhfsdfh")
            /* eslint-disable fecs-camelcase */
            let currentImgInfo = this.data ? this.data[index] : {};
            let {height, width, query, step, wall_time} = currentImgInfo;
            let url = '/data/plugin/images/individualImage?ts=' + wall_time;
            let imgSrc = [url, query].join('&');
            this.imgData = {
                imgSrc,
                height,
                width,
                step,
                wall_time
            }
            /* eslint-enable fecs-camelcase */
        }
    },
    methods: {
        stopInterval() {
            clearInterval(this.getOringDataInterval);
        },
        // get origin data per {{intervalTime}} seconds
        startInterval() {
            this.getOringDataInterval = setInterval(() => {
                this.getOriginChartsData();
            }, intervalTime * 1000);
        },
        handleSlideChange(val) {
            this.currentIndex = val;
        },
        getOriginChartsData() {
            //let {run, tag} = this.tagInfo;
            let run = this.tagInfo.run
            let tag = this.tagInfo.tag
            let {displayName, samples} = tag;
            let params = {
                run,
                tag: displayName,
                samples
            };
            getPluginImagesImages(params).then(({status, data}) => {
                if (status === 0) {
                    this.data = data;
                    this.currentIndex = data.length - 1;
                }
            });
        }
    }
};
</script>
<style lang="stylus">
    .visual-dl-image
        font-size 12px
        width 400px
        float left
        margin 20px 30px 10px 0
        background #fff
        padding 10px
        .visual-dl-image-title
            font-size 14px
            line-height 30px
            .visual-dl-image-run-icon
                background #e4e4e4
                float right
                margin-right 10px
                padding 0 10px
                border solid 1px #e4e4e4
                border-radius 6px
                line-height 20px
                margin-top 4px
        .visual-dl-chart-actions
            .sm-form-item
                width 300px
                display inline-block
</style>

