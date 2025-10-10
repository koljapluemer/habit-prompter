import { createRouter, createWebHistory } from 'vue-router'
import MainView from '../views/MainView.vue'
import MenuView from '../views/MenuView.vue'
import ActionListView from '../views/ActionListView.vue'
import ActionDetailView from '../views/ActionDetailView.vue'
import AddActionView from '../views/AddActionView.vue'
import EditActionView from '../views/EditActionView.vue'
import AboutView from '../views/AboutView.vue'
import SettingsView from '../views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: MainView,
    },
    {
      path: '/menu',
      name: 'menu',
      component: MenuView,
    },
    {
      path: '/actions',
      name: 'list',
      component: ActionListView,
    },
    {
      path: '/actions/new',
      name: 'add-action',
      component: AddActionView,
    },
    {
      path: '/actions/:id',
      name: 'action-detail',
      component: ActionDetailView,
      props: true,
    },
    {
      path: '/actions/:id/edit',
      name: 'edit-action',
      component: EditActionView,
      props: true,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
