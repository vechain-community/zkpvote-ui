import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import NotFound from '@/views/NotFound.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
  },
  {
    path: '/new-proposal',
    name: 'NewPropopsal',
    meta: {
      auth: true,
    },
    component: () => import(/* webpackChunkName: "new-proposal" */ '@/views/NewProposal.vue'),
  },
  {
    path: '/my-proposal',
    name: 'MyProposal',
    meta: {
      auth: true,
    },
    component: () => import(/* webpackChunkName: "my-proposal" */ '@/views/MyProposal.vue'),
  },
  {
    path: '/vote/:voteID',
    name: 'vote',
    props: true,
    component: () => import(/* webpackChunkName: "vote" */ '@/views/Vote.vue'),
  },
  {
    path: '*',
    name: 'NotFound',
    component: NotFound,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
