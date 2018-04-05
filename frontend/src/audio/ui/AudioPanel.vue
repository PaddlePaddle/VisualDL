<template>
    <v-card hover class="visual-dl-audio">
        <h3 class="visual-dl-audio-title">{{tagInfo.tag.displayName}}
            <span class="visual-dl-audio-run-icon">{{tagInfo.run}}</span>
        </h3>
        <p>
            <span>Step:</span>
            <span>{{audioData.step}}</span>
            <span class="visual-del-audio-time">{{audioData.wall_time | formatTime}}</span>
        </p>
        <v-slider :max="steps"
                  :min="slider.min"
                  :step="1"
                  v-model="currentIndex"
                  ></v-slider>

        <audio controls :src="audioData.audioSrc">
            Your browser does not support the audio element.
        </audio>
    </v-card>
</template>
<script>
import {getPluginAudioAudio} from '../../service';

// the time to refresh chart data
const intervalTime = 30;

export default {
    props: ['tagInfo', 'runs', 'running', 'runsItems'],
    computed: {
        steps() {
            let data = this.data || [];
            return data.length - 1;
        }
    },
    filters: {
        formatTime: function (value) {
            if (!value) {
                return;
            }
            // The value was made in seconds, must convert it to milliseconds
            let time = new Date(value * 1000);
            var options = {
                weekday: "short", year: "numeric", month: "short",
                day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit"
            };
            return time.toLocaleDateString("en-US", options);
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
            audioData: {},
            data: [],
        };
    },
    created() {
        this.getOriginAudioData();
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
            if (this.data && this.data[index]) {
                let currentAudioInfo = this.data ? this.data[index] : {};
                let {query, step, wall_time} = currentAudioInfo;
                let url = '/data/plugin/audio/individualAudio?ts=' + wall_time;
                let audioSrc = [url, query].join('&');
                this.audioData = {
                    audioSrc,
                    step,
                    wall_time
                }
            }
        }
    },
    methods: {
        stopInterval() {
            clearInterval(this.getOringDataInterval);
        },
        // get origin data per {{intervalTime}} seconds
        startInterval() {
            this.getOringDataInterval = setInterval(() => {
                this.getOriginAudioData();
            }, intervalTime * 1000);
        },
        getOriginAudioData() {
            //let {run, tag} = this.tagInfo;
            let run = this.tagInfo.run
            let tag = this.tagInfo.tag
            let {displayName, samples} = tag;
            let params = {
                run,
                tag: displayName,
                samples
            };
            getPluginAudioAudio(params).then(({status, data}) => {
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
    .visual-dl-audio
        font-size 12px
        width 420px
        float left
        margin 20px 30px 10px 0
        background #fff
        padding 10px
        .visual-dl-audio-title
            font-size 14px
            line-height 30px
            .visual-dl-audio-run-icon
                background #e4e4e4
                float right
                margin-right 10px
                padding 0 10px
                border solid 1px #e4e4e4
                border-radius 6px
                line-height 20px
                margin-top 4px
        .visual-del-audio-time
            float right
</style>

