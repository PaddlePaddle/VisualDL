<template>
  <div
    @click="$emit('click')"
    class="visual-dl-tags-tab">
    <span :class="active ? 'visual-dl-tags-tab-text-active':'visual-dl-tags-tab-text-inactive' ">{{ title }} &nbsp; ({{ total }})</span>
    </h3>
  </div>
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
    .visual-dl-tags-tab
      border solid 1px #ccc
      line-height 40px
      height 40px
      padding 0 14px
      margin-right 20px
      cursor pointer
      position relative
      display inline-block
      .visual-dl-tags-tab-text-active
        font-size 13px
        font-weight bold
      .visual-dl-tags-tab-text-inactive
        font-size 13px
        font-weight normal

</style>


