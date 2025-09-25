import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import QueueView from '../views/QueueView.vue'
import ManageView from '../views/ManageView.vue'
import HabitsView from '../views/HabitsView.vue'
import EvaluateView from '../views/EvaluateView.vue'
import TodoView from '../views/TodoView.vue'
import SettingsView from '../views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/queue',
      name: 'queue',
      component: QueueView,
    },
    {
      path: '/manage',
      name: 'manage',
      component: ManageView,
      children: [
        {
          path: 'habits',
          name: 'manage-habits',
          component: HabitsView,
        },
        {
          path: 'evaluate',
          name: 'manage-evaluate',
          component: EvaluateView,
        },
        {
          path: 'todo',
          name: 'manage-todo',
          component: TodoView,
        },
      ],
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    },
  ],
})

export default router
