import { createRouter, createWebHistory } from 'vue-router';
import IndexView from '@/views/IndexView.vue';
import SpaceView from '@/views/SpaceView.vue';
import HomeView from '@/views/HomeView.vue';

const routes = [
  { path: '/', name: 'Index', component: IndexView },
  { path: '/space', name: 'Space', component: SpaceView },
  { path: '/home', name: 'Home', component: HomeView }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
