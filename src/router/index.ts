import { createRouter, createWebHistory } from 'vue-router'
import MainView from '../views/MainView.vue'
import MenuView from '../views/MenuView.vue'
import TaskOfTheDayView from '../views/TaskOfTheDayView.vue'
import EntityListView from '../views/EntityListView.vue'
import EntityDetailView from '../views/EntityDetailView.vue'
import AddEntityView from '../views/AddEntityView.vue'
import EditEntityView from '../views/EditEntityView.vue'
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
      path: '/task-of-the-day',
      name: 'task-of-the-day',
      component: TaskOfTheDayView,
    },
    {
      path: '/actions',
      name: 'entity-list',
      component: EntityListView,
    },
    {
      path: '/entities',
      redirect: '/actions',
    },
    {
      path: '/entities/new',
      name: 'add-entity',
      component: AddEntityView,
    },
    {
      path: '/actions/new',
      redirect: '/entities/new',
    },
    {
      path: '/entities/:id',
      name: 'entity-detail',
      component: EntityDetailView,
      props: true,
    },
    {
      path: '/actions/:id',
      redirect: to => `/entities/${to.params.id}`,
    },
    {
      path: '/entities/:id/edit',
      name: 'edit-entity',
      component: EditEntityView,
      props: true,
    },
    {
      path: '/actions/:id/edit',
      redirect: to => `/entities/${to.params.id}/edit`,
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
