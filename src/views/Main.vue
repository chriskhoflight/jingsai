<style lang="less">
@import "./main.less";
</style>

<template>
<div class="layout">
  <Layout class="main">
    <Header :style="{ position: 'fixed', width: '100%'}" class="main-header"> 
      <app-header ></app-header>
    </Header>
    <Content :style="{margin: '80px 0 0 0'}">
      <div class="main" :class="{'main-hide-text': shrink}">
        <div class="sidebar-menu-con menu-bar" :style="{width: shrink?'60px':'220px', overflow: shrink ? 'visible' : 'auto'}">
          <shrinkable-menu :shrink="shrink" @on-change="handleSubmenuChange" :theme="menuTheme" :before-push="beforePush" :open-names="openedSubmenuArr" :menu-list="menuList">
          </shrinkable-menu>
        </div>
        <div class="single-page-con" :style="{left: shrink?'60px':'220px'}">
          <div class="single-page">
            <keep-alive :include="cachePage">
              <router-view></router-view>
            </keep-alive>
          </div>
        </div>
      </div>
    </Content>
  </Layout>
</div>
</template>

<script>
import appHeader from '@/views/components/header/app-header'
import shrinkableMenu from "@/views/components/shrinkable-menu/shrinkable-menu.vue";
import tagsPageOpened from "@/views/components/tags-page-opened.vue";
import breadcrumbNav from "@/views/components/breadcrumb-nav.vue";

import Cookies from "js-cookie";
import util from "@/libs/util.js";

export default {
  components: {
    appHeader,
    shrinkableMenu,
    tagsPageOpened,
    breadcrumbNav
  },
  data() {
    return {
      shrink: false,
      openedSubmenuArr: this.$store.state.app.openedSubmenuArr
    };
  },
  computed: {
    menuList() {
      //根据路由当前路径计算顶级路径,加载整个路由信息
      var path = this.$route.path;
      var menuList = this.$store.state.app.menuList;
      return util.getMenusByPath(menuList,path);
    },
    pageTagsList() {
      return this.$store.state.app.pageOpenedList; // 打开的页面的页面对象
    },
    currentPath() {
      return this.$store.state.app.currentPath; // 当前面包屑数组
    },
    menuTheme() {
      return this.$store.state.app.menuTheme;
    },
    cachePage() {
      return this.$store.state.app.cachePage;
    },
  },
  stompClient: {
    monitorIntervalTime: 100,
    stompReconnect: true,
    timeout(orgCmd) {}
  },
  methods: {
    init() {
      // let pathArr = util.setCurrentPath(this, this.$route.name);
      // // this.$store.commit("updateMenulist");
      // if (pathArr.length >= 2) {
      //   this.$store.commit("addOpenSubmenu", pathArr[1].name);
      // }
      // let userInfo = JSON.parse(Cookies.get("userInfo"));
      // this.username = userInfo.username;
      // this.userId = userInfo.id;
      //this.checkTag(this.$route.name);
    },
    toggleClick() {
      this.shrink = !this.shrink;
    },
    
    checkTag(name) {
      let openpageHasTag = this.pageTagsList.some(item => {
        if (item.name === name) {
          return true;
        }
      });
      if (!openpageHasTag) {
        //  解决关闭当前标签后再点击回退按钮会退到当前页时没有标签的问题
        util.openNewPage(
          this,
          name,
          this.$route.params || {},
          this.$route.query || {}
        );
      }
    },
    handleSubmenuChange(val) {
      // console.log(val)
    },
    beforePush(name) {
      // console.log(name)
      return true;
    },
    
  },
  watch: {
    $route(to) {
      this.$store.commit("setCurrentPageName", to.name);
      let pathArr = util.setCurrentPath(this, to.name);
      if (pathArr.length > 2) {
        this.$store.commit("addOpenSubmenu", pathArr[1].name);
      }
      //this.checkTag(to.name);
      localStorage.currentPageName = to.name;
    },
  },
  mounted() {
    this.init();
  },
  created() {
    // 显示打开的页面的列表
    this.$store.commit("setOpenedList");
  }
};
</script>
