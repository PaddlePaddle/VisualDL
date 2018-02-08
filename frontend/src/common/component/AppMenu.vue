<template>
    <div>
        AppMenu goes here
        <p>{{ msg }} </p>

        <div class="visual-dl-app-menu">
        <!--<san-appbar title=" ">-->
            <!--<san-menu slot="right">-->
                <!--<san-menu-item-->
                    <!--s-for="item in items"-->
                    <!--class="{{selected === item.name ? 'sm-menu-item-selected' : ''}}"-->
                    <!--on-click="handleItemClick(item)"-->
                    <!--title="{{item.title}}" />-->
            <!--</san-menu>-->
        <!--</san-appbar>-->
        </div>
    </div>
</template>

<script>
export default {
  name: 'AppMenu',
  data () {
    return {
      msg: 'Welcome to Your App Menu'
    }
  }
}
</script>

<style>
+prefix-classes(prefix)
    .app-menu
        width 100%

.visual-dl-app-menu
    .sm-appbar-title
        font-size 24px
        flex none
        margin-right 50px
    .sm-appbar-title
        background url('./visualdl-logo.png') no-repeat
        background-size cover
        width 120px
        height 50px
    .sm-appbar-right
        width 100%
        .sm-menu
            width 100%
            height 100%
            display flex
            flex-direction row
            .sm-menu-item
                padding 0 30px
                .sm-menu-item-content
                    color #fff
                    opacity 0.6
            .sm-menu-item:hover
                background none
                opacity 1
            .sm-menu-item-selected
                .sm-menu-item-content
                    color #fff
                    opacity 1
</style>