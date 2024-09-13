import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import UsersView from '@/views/UsersView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView
    },
    {
      path: '/users/:userId', // Dynamic route for user ID
      name: 'UserInfo',
      component: UsersView,
    },
  ]
});

export default router;