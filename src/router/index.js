import { createRouter, createWebHistory } from 'vue-router'
import PortalLayout from '../layout/portallayout.vue'
import Dashboard from '../pages/Dashboard.vue'
import Login from '../pages/Login.vue'
import Events from '../pages/Events.vue'
import EventDetail from '../components/events/Eventdetail.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/',
    component: PortalLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: Dashboard },
      { path: 'events', name: 'Events', component: Events },
      { path: 'events/:id', name: 'EventDetail', component: EventDetail },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: { name: 'Dashboard' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const isLoggedIn = !!localStorage.getItem('gnsw_user')
  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'Login' }
  }
  if (to.name === 'Login' && isLoggedIn) {
    return { name: 'Dashboard' }
  }
})

export default router