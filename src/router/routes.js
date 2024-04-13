const routes = [
    {
        path: '/test',
        name: 'test',
        component: () => import('../views/Test.vue')
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