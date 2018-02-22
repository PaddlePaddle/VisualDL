<template>
    <div>
        <div class="visual-dl-app-menu">
            <v-toolbar dark color="teal">
                <v-toolbar-title class="appbar-menu-title"></v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn v-for="item in items" :key="item.name"
                :class="[selected === item.name ? 'menu-item-selected': '', 'menu-item']"
                @click="handleItemClick(item)"
                >{{ item.title}}</v-btn>
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

.visual-dl-app-menu
    .appbar-menu-title
        font-size 24px
        flex none
        margin-right 50px
    .appbar-menu-title
        background url('./visualdl-logo.png') no-repeat
        background-size cover
        width 120px
        height 50px

    .menu-item
        padding 0 30px
        color #fff
        opacity 0.6
        display flex
        flex-direction row

    .menu-item:hover
        background none
        opacity 1

    .menu-item-selected
        color #fff
        opacity 1
</style>
