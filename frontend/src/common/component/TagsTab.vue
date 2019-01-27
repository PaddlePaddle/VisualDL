<template>
  <v-card
    hover
    color="tag_background"
    class="visual-dl-tags-tab">
    <div
      @click="$emit('click')">
    <span :class="active ? 'visual-dl-tags-tab-text-active':'visual-dl-tags-tab-text-inactive' ">{{ title }} &nbsp; ({{ total }})</span>
    </div>
  </v-card>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
    },
  },
};
</script>
<style lang="stylus">
    .visual-dl-tags-search-input
      outline none
      font-size 12px
    .visual-dl-tags-tab
      border-radius 17px
      line-height 34px
      height 34px
      padding 0 14px
      margin-right 16px
      cursor pointer
      position relative
      display inline-block
      .visual-dl-tags-tab-text-active
        font-size 12px
        font-weight bold
      .visual-dl-tags-tab-text-inactive
        font-size 12px
        font-weight normal
        color #555555

</style>


