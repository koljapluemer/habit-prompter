import { createRouter, createWebHistory } from 'vue-router'
import QueueView from '../views/QueueView.vue'
import HabitsView from '../views/HabitsView.vue'
import EvaluateView from '../views/EvaluateView.vue'
import TodoView from '../views/TodoView.vue'
import SettingsView from '../views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'queue',
      component: QueueView,
    },
    {
      path: '/habits',
      name: 'habits',
      component: HabitsView,
    },
    {
      path: '/eval',
      name: 'eval',
      component: EvaluateView,
    },
    {
      path: '/todos',
      name: 'todos',
      component: TodoView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    },
  ],
})

export default router
