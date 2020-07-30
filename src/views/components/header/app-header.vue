<!--
  公共顶部
  上:logo+导航+用户相关信息
-->
<template>
  <Row class="header-main">
    <Col span="6">
      <div class="layout-logo">
        <img  src="@/assets/logo-min.jpg" key="min-logo" />
      </div>
      <div><span class="logo-text">{{pomnameName}}</span></div>
    </Col>
    <Col span="13">
      <Row type="flex" justify="end" >
         <nav-menu 
            :menu-theme="menuTheme" 
            :menu-list="menuList" 
            @on-change="handleChange">
        </nav-menu>
      </Row>
    </Col>
    <Col span="5" class="header-main-header">
      <div class="header-avator-con">
        <full-screen v-model="isFullScreen" @on-change="fullscreenChange"></full-screen> 
        <Dropdown transfer trigger="hover"  @on-click="handleLanDropdown" class="options">
          <Icon type="md-globe" :size="24" class="language"></Icon>
          <DropdownMenu slot="list">
            <DropdownItem name="zh-CN">中文</DropdownItem>
            <DropdownItem name="en-US">English</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <lock-screen></lock-screen>
        <message-tip v-model="mesCount"></message-tip> 
        <div class="user-dropdown-menu-con">
          <Row type="flex" justify="end" align="middle" class="user-dropdown-innercon">
            <Dropdown transfer trigger="hover" @on-click="handleClickUserDropdown">
              <a href="javascript:void(0)">
                <span class="main-user-name">{{ username }}</span>
                <Icon type="md-arrow-dropdown" />
                <Avatar v-if="avatarPath"   :src="avatarPath" style="background: #619fe7;"/>
                <Avatar v-else style="background-color: #87d068" icon="ios-person"/>
              </a>
              <DropdownMenu slot="list">
                <DropdownItem name="ownSpace">{{ $t('userCenter') }}</DropdownItem>
                <DropdownItem name="changePass">{{ $t('changePass') }}</DropdownItem>
                <DropdownItem name="loginout" divided>{{ $t('logout') }}</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </Row>
        </div>
      </div>
    </Col>
  </Row>
</template>
<script>
import './app-header.less'
import navMenu from "@/views/components/nav-menu/navMenu.vue";
import fullScreen from "@/views/components/fullscreen.vue";
import lockScreen from "@/views/components/lockscreen/lockscreen.vue";
import messageTip from "@/views/components/message-tip.vue";
import Cookies from "js-cookie";
import util from "@/libs/util.js";
import setting from "@/settings.js";

export default {
  name: 'appHeader',
  components: {
    navMenu,
    fullScreen,
    lockScreen,
    messageTip
  },
  props: {
    activeName: {
      type: String,
      default: ''
    },
  },
  data () {
    return {
      username: "",
      userId: "",
      isFullScreen: false,
      pomnameName: "",
    }
  },
  computed: {
    menuTheme() {
      return this.$store.state.app.menuTheme;
    },
    menuList() {
      return this.$store.state.app.menuList;
    },
     avatarPath() {
      return localStorage.avatorImgPath;
    },
    lang() {
      return this.$store.state.app.lang;
    },
    mesCount() {
      return this.$store.state.app.messageCount;
    }
  },
  methods: {
    init() {
      // let pathArr = util.setCurrentPath(this, this.$route.name);
      // // this.$store.commit("updateMenulist");
      // if (pathArr.length >= 2) {
      //   this.$store.commit("addOpenSubmenu", pathArr[1].name);
      // }
      let userInfo = JSON.parse(Cookies.get("userInfo"));
      this.username = userInfo.username;
      this.userId = userInfo.id;
 
    },
    handleChange (name) {

    },
    fullscreenChange(isFullScreen) {
      // console.log(isFullScreen);
    },
    handleLanDropdown(name) {
      localStorage.lang = name;
      this.$store.commit("switchLang", name);
    },
    handleClickUserDropdown(name) {
      if (name === "ownSpace") {
        util.openNewPage(this, "ownspace_index");
        this.$router.push({
          name: "ownspace_index"
        });
      } else if (name === "changePass") {
        util.openNewPage(this, "change_pass");
        this.$router.push({
          name: "change_pass"
        });
      } else if (name === "loginout") {
        // 退出登录
        this.$store.commit("logout", this);
        this.$store.commit("clearOpenedSubmenu");
        // 强制刷新页面 重新加载router
        location.reload();
      }
    },
  },
  watch: {
    lang() {
      util.setCurrentPath(this, this.$route.name); // 在切换语言时用于刷新面包屑
    }
  },
  mounted () {
    this.init();
    this.pomnameName = setting.title;
  }
}
</script>
