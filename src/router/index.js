import Vue from 'vue';
import iView from 'iview';
import Util from '../libs/util';
import VueRouter from 'vue-router';
import Cookies from 'js-cookie';
import { routers, otherRouter } from './router';
import store from '../store';

Vue.use(VueRouter);

// 路由配置
const RouterConfig = {
    // mode: 'history',
    routes: routers
};

function exportWhiteListFromRouter(router){
    let res = []
    for(let item of router)
        res.push(item.path)
    return res
}

// 路由白名单
const whiteList = exportWhiteListFromRouter(routers)

export const router = new VueRouter(RouterConfig);

router.beforeEach((to, from, next) => {
    iView.LoadingBar.start();
    Util.title(to.meta.title);
    if (Cookies.get('locking') === '1' && to.name !== 'locking') {
        // 判断当前是否是锁定状态
        next({
            replace: true,
            name: 'locking'
        });
    } else if (Cookies.get('locking') === '0' && to.name === 'locking') {
        next(false);
    } else {
        // 白名单则跳过，无需登录
        let first = to.path.indexOf("/") + 1; // 从第一个斜杠算起（+1表示不包括该横杠）
        let tow = to.path.indexOf("/", first); // 第一个斜杠后的第一个横杠（即第二个横杠）
        let parentPath = '';
        if(tow != -1){
            parentPath =  to.path.substring(0,tow)
        }
        if(whiteList.indexOf(to.path) != -1 || whiteList.indexOf(parentPath) != -1){
            console.log("白名单")
            next()
            return
        }
        if (!Cookies.get('userInfo') && to.name !== 'login') { // 判断是否已经登录且前往的页面不是登录页
        // if (!Cookies.get('userInfo') && to.name !== 'login' && to.name !== 'regist' && to.name !== 'regist-result' && to.name !== 'relate') { // 判断是否已经登录且前往的页面不是登录页
            next({
                name: 'login'
            });
        } else if (Cookies.get('userInfo') && to.name === 'login') {
            // 判断是否已经登录且前往的是登录页
            Util.title();
            next({
                name: 'home_index'
            });
        } else {
            Util.toDefaultPage([...routers], to.name, router, next);
        }
    }
});

router.afterEach((to) => {
    Util.openNewPage(router.app, to.name, to.params, to.query);
    iView.LoadingBar.finish();
    window.scrollTo(0, 0);
});
