<style lang="less">
</style>
<template>
  <Menu  ref="navMenu"  mode="horizontal"   :active-name="$route.name" :theme="menuTheme"   @on-select="changeMenu">
    <template v-for="item in menuList">
        <!--主键是Main时，布局为左右布局，导航只显示父级，隐藏子级。-->
        <template v-if="item.hideChild">
            <MenuItem :name="item.name" :key="'menuitem' + item.name">
              <Icon :type="item.icon || item.icon" :size="iconSize" :key="'menuicon' + item.name"></Icon>
              <span  :key="'title' + item.name">{{ itemTitle(item) }}</span>
          </MenuItem>
        </template> 
        <template v-else>
          <MenuItem v-if="item.children.length<=1" :name="item.children[0].name" :key="'menuitem' + item.name">
              <Icon :type="item.children[0].icon || item.icon" :size="iconSize" :key="'menuicon' + item.name"></Icon>
              <span  :key="'title' + item.name">{{ itemTitle(item.children[0]) }}</span>
          </MenuItem>

          <Submenu v-if="item.children.length > 1" :name="item.name" :key="item.name">
              <template slot="title">
                  <Icon :type="item.icon" :size="iconSize"></Icon>
                  <span >{{ itemTitle(item) }}</span>
              </template>
              <template v-for="child in item.children">
                  <MenuItem :name="child.name" :key="'menuitem' + child.name" v-if="!child.hidden">
                      <Icon :type="child.icon" :size="iconSize" :key="'icon' + child.name"></Icon>
                      <span  :key="'title' + child.name">{{ itemTitle(child) }}</span>
                  </MenuItem>
              </template>
          </Submenu>
        </template>
      </template>
  </Menu>
</template>

<script>
export default {
  name: "navMenu",
  data() {
    return {
      singleOpenName: []
    };
  },
  props: {
    menuList: Array,
    iconSize: Number,
    menuTheme: {
      type: String,
      default: "dark"
    }
  },
  methods: {
    changeMenu(name) {
      this.$router.push({
          name: name
      });
      this.$emit('on-change', name);
    },
    // handleSelect(name) {
    //     console.log(name);
    //         console.log(this.$router);
    //   this.$emit("on-select", name);
    // },
    itemTitle(item) {
      if (typeof item.title === "object") {
        return this.$t(item.title.i18n);
      } else {
        return item.title;
      }
    },
    getOpenedNamesByActiveName(name) {
      return this.$route.matched
        .map(item => item.name)
        .filter(item => item !== name);
    }
  },
  updated() {
    this.$nextTick(() => {
      if (this.$refs.navMenu) {
        this.$refs.navMenu.updateOpened();
      }
    });
  },
  watch: {
    // 监听路由变化
    $route(to, from) {
      this.singleOpenName = [this.$route.matched[0].name];
    }
  },
  mounted() {
    //console.log(this.menuList);
    this.singleOpenName = [this.$route.matched[0].name];
  }
};
</script>
