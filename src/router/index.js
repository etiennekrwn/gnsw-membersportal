import { createRouter, createWebHistory } from 'vue-router'
import PortalLayout from '../layout/portallayout.vue'
import Dashboard from '../pages/Dashboard.vue'
import Login from '../pages/Login.vue'
import Events from '../pages/Events.vue'
import EventDetail from '../components/events/Eventdetail.vue'
import Article from '../pages/Article.vue'
import MyWriting from '../pages/MyWriting.vue'
import Learning from '../pages/Learning.vue'
import CourseDetail from '../pages/CourseDetail.vue'
import Lesson from '../pages/Lesson.vue'
import DraftEditor from '../pages/DraftEditor.vue'
import Profile from '../pages/Profile.vue'
import Settings from '../pages/Settings.vue'
import PublishedPost from '../pages/PublishedPost.vue'
import SearchResults from '../pages/SearchResults.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login },

  // Editor routes — full screen, no layout wrapper
  {
    path: '/my-writing/new',
    name: 'DraftNew',
    component: DraftEditor,
    meta: { requiresAuth: true },
  },
  {
    path: '/my-writing/:id/edit',
    name: 'DraftEdit',
    component: DraftEditor,
    meta: { requiresAuth: true },
  },

  {
    path: '/',
    component: PortalLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: Dashboard },
      { path: 'events', name: 'Events', component: Events },
      { path: 'events/:id', name: 'EventDetail', component: EventDetail },
      { path: 'article/:id', name: 'Article', component: Article },
      { path: 'my-writing', name: 'MyWriting', component: MyWriting },
      { path: 'published/:id', name: 'PublishedPost', component: PublishedPost },
      { path: 'learning', name: 'Learning', component: Learning },
      { path: 'learning/:courseId', name: 'CourseDetail', component: CourseDetail },
      { path: 'learning/:courseId/lesson/:lessonId', name: 'Lesson', component: Lesson },
      { path: 'search', name: 'Search', component: SearchResults },
      { path: 'profile', name: 'Profile', component: Profile },
      { path: 'settings', name: 'Settings', component: Settings },
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
