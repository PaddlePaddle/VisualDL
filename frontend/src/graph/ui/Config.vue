<template>
    <div class="visual-dl-graph-config-com">
        <div class="graph-config-upper">
            <v-btn
                class="visual-dl-graph-config-button"
                color="primary"
                @click="handleFitScreen"
                dark>
                <v-icon style="margin-right: 6px" size="20">fullscreen</v-icon>
                Fit &nbsp; to &nbsp; screen
            </v-btn>

            <v-btn
                class="visual-dl-graph-config-button"
                color="primary"
                @click="handleDownload"
                dark>
                <v-icon style="margin-right: 6px">file_download</v-icon>
                Download image
            </v-btn>

            <v-slider
                label="Scale"
                max="1"
                min="0.1"
                step="0.1"
                v-model="config.scale"
                dark></v-slider>
        </div>
        <div class="node-info">
            <h3>Node Info: </h3>

            <div v-if="curNode.nodeType === 'input'">
                <div>Node Type: {{ curNode.nodeType }}</div>
                <div>Name: {{curNode.nodeInfo.name}}</div>
                <div>Shape: {{curNode.nodeInfo.shape}}</div>
                <div>Data Type: {{curNode.nodeInfo.data_type}}</div>
            </div>
            <div v-else-if="curNode.nodeType === 'output'">
                <div>Node Type: {{ curNode.nodeType }}</div>
            </div>
            <div v-else-if="curNode.nodeType === 'operator'">
                <div>Node Type: {{ curNode.nodeType }}</div>
                <div>Input: {{curNode.nodeInfo.input}}</div>
                <div>Operator Type: {{curNode.nodeInfo.opType}}</div>
                <div>Output: {{curNode.nodeInfo.output}}</div>
            </div>
            <div v-else>

            </div>
        </div>
    </div>
</template>
<script>

export default {
    props:['config', 'curNode'],
    methods: {
        handleFitScreen() {
            this.$emit('fitScreen')
        },
        handleDownload() {
            this.$emit('download')
        }
    }
};
</script>
<style lang="stylus">
@import '../../style/variables';
+prefix-classes('visual-dl-graph-')
    .config-com
        width 90%
        margin 20px auto
        color $-right-font-color
        .config-button
            width 200px
            margin-top 20px
.visual-dl-graph-config-com
    .sm-icon
        width 36px
        height 26px

.graph-config-upper
    height 400px

</style>
