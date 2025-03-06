import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/results',
      name: 'results',
      component: () => import('../views/ResultsView.vue')
    },
    {
      path: '/tests',
      name: 'tests',
      component: () => import('../views/TestsView.vue')
    }
  ]
})

export default router
