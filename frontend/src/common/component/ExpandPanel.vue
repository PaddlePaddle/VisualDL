<template>
  <div class="visual-dl-expand-panel">
    <h3
      class="visual-dl-expand-head"
      @click="isShow = !isShow"
    >
      <span>{{ title }}</span>
      <span class="visual-dl-expand-head-info">
        <v-icon
          class="visual-dl-expand-head-arrow"
          size="20">{{ iconName }}</v-icon>
        <span class="visual-dl-expand-head-num">({{ info }})</span>
      </span>
    </h3>
    <div
      v-if="isShow"
      class="visual-dl-expand-panel-content"
    >
      <slot/>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    info: {
      type: Number,
      required: true,
    },
  },
  computed: {
    iconName() {
      return this.isShow ? 'expand_less' : 'expand_more';
    },
  },
  data() {
    return {
      isShow: true,
    };
  },
};
</script>
<style lang="stylus">
    .visual-dl-expand-panel
        .visual-dl-expand-head
            border solid 1px #ccc
            line-height 50px
            height 50px
            padding 0 20px
            margin-right 2%
            cursor pointer
            position relative
            .visual-dl-expand-head-info
                position absolute
                left 90%
                .visual-dl-expand-head-arrow
                    vertical-align middle
                .visual-dl-expand-head-num
                    line-height 20px
                    font-size 12px
                    font-weight normal
        .visual-dl-expand-panel-content:after
            content: "";
            clear: both;
            display: block;
</style>


