import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', redirect: '/index' },
  {
    path: '/index',
    component: () => import('@views/Index/Index.vue'),
  },
  {
    path: '/rank',
    name: 'rank',
    component: () => import('@views/Rank/Index.vue'),
  },
  {
    path: '/playlist',
    name: 'playlist',
    component: () => import('@views/PlayList/Index.vue'),
  },
  {
    path: '/playlist/detail',
    name: 'playlistdetail',
    component: () => import('@views/PlayList/Detail.vue'),
  },
  {
    path: '/mvlist',
    name: 'mvlist',
    component: () => import('@views/MvList/Index.vue'),
  },
  {
    path: '/mv',
    name: 'mv',
    component: () => import('@views/MvList/Detail.vue'),
  },
  {
    path: '/artist',
    name: 'artist',
    component: () => import('@views/Artist/Index.vue'),
  },
  {
    path: '/singer',
    name: 'singer',
    component: () => import('@views/Singer/Index.vue'),
  },
  {
    path: '/song',
    name: 'song',
    component: () => import('@views/Song/Index.vue'),
  },
  {
    path: '/user',
    name: 'user',
    component: () => import('@views/User/Index.vue'),
  },
  {
    path: '/album',
    name: 'album',
    component: () => import('@views/Album/Index.vue'),
  },
  { path: '/dj', name: 'dj', component: () => import('@views/Dj/Index.vue') },
  {
    path: '/search',
    name: 'search',
    component: () => import('@views/Search/Index.vue'),
  },
  {
    path: '/video',
    name: 'video',
    component: () => import('@views/Video/Index.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
