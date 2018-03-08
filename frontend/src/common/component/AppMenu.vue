<template>
    <div>
        <div class="visual-dl-app-menu">
            <v-toolbar color="primary" dark>
                <v-toolbar-title class="appbar-menu-title"></v-toolbar-title>
                <v-toolbar-items>
                    <v-btn v-for="item in items" :key="item.name"
                    flat dark :class="selected === item.name ? 'menu-item-selected': 'menu-item'"
                    @click="handleItemClick(item)"
                    >{{ item.title}}</v-btn>
                </v-toolbar-items>
            </v-toolbar>
        </div>
    </div>
</template>

<script>
export default {
    props: ['initialRoute'],
    name: 'AppMenu',
    data () {
        return {
        selected: this.initialRoute,
        items: [
            {
                url: '/scalars',
                title: 'SCALARS',
                name: 'scalars'
            },
            {
                url: '/images',
                title: 'IMAGES',
                name: 'images'
            },
            {
                url: '/histograms',
                title: 'HISTOGRAMS',
                name: 'histograms'
            },
            {
                url: '/graphs',
                title: 'GRAPHS',
                name: 'graphs'
            }
            ]
        }
    },
    methods: {
        handleItemClick: function (item) {
            this.selected = item.name
            this.$router.push(item.url)
        }
    }
}
</script>

<style scoped lang="stylus">
@import '~style/variables';

.visual-dl-app-menu
    .appbar-menu-title
        flex none
        margin-right 50px
        background url('./visualdl-logo.png') no-repeat
        background-size cover
        width 120px
        height 50px

    .menu-item
        font-size 16px
        background none
        padding 0 10px
        color #fff
        opacity 0.6
        display flex
        flex-direction row
        font-weight bold

    .menu-item:hover
        opacity 1

    .menu-item-selected
        @extends .visual-dl-app-menu .menu-item
        opacity 1
</style>
