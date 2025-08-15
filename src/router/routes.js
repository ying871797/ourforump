const routes = [
    {
        path: '/test',
        name: 'test',
        component: () => import('../views/Test.vue')
    },
    {
        path: '/admin87',
        name: 'admin87',
        meta: {
            title: 'OurForum-管理员'
        },
        component: () => import('../views/Admin.vue')
    },
    {
        path: '/about',
        name: 'about',
        meta: {
            title: '关于'
        },
        component: () => import('../views/AboutPage.vue')
    },
    {
        path: '/products',
        name: 'products',
        meta: {
            title: '系列产品',
        },
        component: () => import('../views/ProductsShowPage.vue')
    }
    /*{
        path: '/',
        name: 'index',
        meta: {
            title: 'OurForum-首页'
        },
        props: {
            database: 'welcomedata',
            sendpasstype: 'send_welcome',
            type_: 0
        },
        component: () => import('../components/ChatPage.vue')
    },
    {
        path: '/class6',
        name: 'class6',
        meta: {
            title: 'OurForum-class6',
        },
        props: {
            database: 'data',
            type_: 1,
            enterpasstype: 'page_class6'
        },
        component: () => import("../components/ChatPage.vue"), //.vue不能省略
    },
    {
        path: '/for_visitors',
        name: 'for_visitors',
        meta: {
            title: 'OurForum-首页'
        },
        props: {
            database: 'forvisitors',
            type_: 2
        },
        component: () => import('../components/ChatPage.vue')
    }*/
]
export default routes