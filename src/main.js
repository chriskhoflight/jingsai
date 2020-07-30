// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import iView from 'iview'
import qrCode from 'qrcode'
import iviewArea from 'iview-area'
import App from './App'
import { router } from './router/index'
import store from './store'
import '@/locale'
import 'iview/dist/styles/iview.css'
import VueI18n from 'vue-i18n'
import Icon from 'vue-awesome/components/Icon'
import vueMap from "@/views/components/baidu-map/map.vue"
// import qrCode from "@/views/components/qrCode/qrCode.vue"
// 按需引入awesome图标
import 'vue-awesome/icons/brands/qq'
import 'vue-awesome/icons/brands/weixin'
import 'vue-awesome/icons/brands/weibo'
import 'vue-awesome/icons/brands/github'
import { getRequest, postRequest, putRequest, deleteRequest, uploadFileRequest } from '@/libs/axios'
import { setStore, getStore, removeStore } from '@/libs/storage'
import util from '@/libs/util'
import hasPermission from '@/libs/hasPermission'
import hasRole from '@/libs/hasRole'
import VueLazyload from 'vue-lazyload'
import VueClipboard from 'vue-clipboard2'
import TreeTable from 'tree-table-vue'
import BaiduMap from 'vue-baidu-map'
import moment from 'moment'
//引入定制主题样式
import './index.less'
import '@babel/polyfill'
//定义全局过滤器
moment.locale('zh-cn')//设置语言为中文
Vue.filter('dateFormat',function(date,pattern="YYYY-MM-DD HH:mm:ss"){
    if(date===''){
        return moment().fromNow().replace(/\s+/g,"") // \s 匹配任何空格 +匹配前面的子表达式一次或多次  g修饰符表示全局搜索
    }
    return moment(date,pattern).fromNow().replace(/\s+/g,"");
})


Vue.config.productionTip = false
Vue.use(VueLazyload, {
    error: require('./assets/img-error.png'),
    loading: require('./assets/loading2.gif')
})
Vue.use(VueI18n);
//全局设置
Vue.use(iView,{
    transfer: true,
    //size: 'small',
    // select: {
    //     arrow: 'md-arrow-dropdown',
    //     arrowSize: 20
    // }
});
Vue.use(iviewArea);
Vue.use(VueClipboard);
Vue.use(TreeTable);
Vue.component('icon', Icon);
Vue.component('vueMap',vueMap);
Vue.component('qrCode',qrCode);
Vue.use(hasPermission);
Vue.use(hasRole);
Vue.use(BaiduMap, {
    // ak 是在百度地图开发者平台申请的密钥 详见 http://lbsyun.baidu.com/apiconsole/key */
    ak: 'ba5Z5VMvpUnrfsUxG9XgL8yPYTdesCPQ'
  })
// 挂载全局使用的方法
Vue.prototype.getRequest = getRequest;
Vue.prototype.postRequest = postRequest;
Vue.prototype.putRequest = putRequest;
Vue.prototype.deleteRequest = deleteRequest;
Vue.prototype.uploadFileRequest = uploadFileRequest;
Vue.prototype.setStore = setStore;
Vue.prototype.getStore = getStore;
Vue.prototype.removeStore = removeStore;
 
/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App),
    data: {
        currentPageName: ''
    },
    mounted() {
        // 初始化菜单
        util.initRouter(this);
        this.currentPageName = this.$route.name;
        // 显示打开的页面的列表
        this.$store.commit('setOpenedList');
        this.$store.commit('initCachepage');
    }
})
