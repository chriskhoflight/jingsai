import Main from '@/views/Main.vue';
import AppMain from '@/views/AppMain.vue';

// 不作为Main组件的子页面展示的页面单独写，如下
export const loginRouter = {
    path: '/login',
    name: 'login',
    meta: {
        title: '登录'
    },
    component: () => import('@/views/login/login.vue')
};

export const registRouter = {
    path: '/regist',
    name: 'regist',
    meta: {
        title: '注册'
    },
    component: () => import('@/views/login/regist.vue')
};

export const registResult = {
    path: '/regist-result',
    name: 'regist-result',
    meta: {
        title: '注册结果'
    },
    component: () => import('@/views/login/regist-result.vue')
};

 
// export const page404 = {
//     path: '/*',
//     name: 'error-404',
//     meta: {
//         title: '404-页面不存在'
//     },
//     component: () => import('@/views/common/error-page/404.vue')
// };

export const page403 = {
    path: '/403',
    meta: {
        title: '403-权限不足'
    },
    name: 'error-403',
    component: () => import('@/views/common/error-page/403.vue')
};

export const page500 = {
    path: '/500',
    meta: {
        title: '500-服务端错误'
    },
    name: 'error-500',
    component: () => import('@/views/common/error-page/500.vue')
};

export const locking = {
    path: '/locking',
    name: 'locking',
    component: () => import('@/views/components/lockscreen/components/locking-page.vue')
};

// gxr添加无需登录可以访问组件
export const wxSeeContentRouter = {
    path: '/wxSeeContent',
    name: 'wxSeeContent',
    component: () => import('@/views/lsbusiness/publish/wxSeeContent.vue')
};

// 作为Main组件的子页面展示但是不在左侧菜单显示的路由写在otherRouter里
export const otherRouter = {
    path: '/',
    name: 'otherRouter',
    redirect: '/home',
    component: AppMain,
    children: [
        { path: 'home', title: { i18n: 'home' }, name: 'home_index', component: () => import('@/views/home/home.vue') },
        { path: 'ownspace', title: '个人中心', name: 'ownspace_index', component: () => import('@/views/common/own-space/own-space.vue') },
        { path: 'change-pass', title: '修改密码', name: 'change_pass', component: () => import('@/views/common/change-pass/change-pass.vue') },
        { path: 'message', title: '消息中心', name: 'message_index', component: () => import('@/views/common/message/message.vue') },
        { path: 'add', title: '添加', name: 'add', component: () => import('@/views/develop/new-window/add.vue') },
        { path: 'edit', title: '编辑', name: 'edit', component: () => import('@/views/develop/new-window/edit.vue') },
        { path: 'message-send-detail', title: '消息发送详情', name: 'message_send_detail', component: () => import('@/views/sys/message-manage/messageSendDetail.vue') }
    ]
};


export const appRouter = [];

// 所有上面定义的路由都要写在下面的routers里
//以下配置路由都为白名单
export const routers = [
    // 公众号菜单访问页面
    loginRouter,
    registRouter,
    registResult,
    otherRouter,
    locking,
    ...appRouter,
    // page404,
    page500,
    page403,
    wxSeeContentRouter,
];
