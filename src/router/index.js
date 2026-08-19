import { createRouter, createWebHistory } from 'vue-router'
import PortalLayout from '../layout/portallayout.vue'
import Dashboard from '../pages/Dashboard.vue'
import Login from '../pages/Login.vue'
import SetPassword from '../pages/SetPassword.vue'
import ForgotPassword from '../pages/ForgotPassword.vue'
import ResetPassword from '../pages/ResetPassword.vue'
import Onboarding from '../pages/Onboarding.vue'
import Events from '../pages/Events.vue'
import EventDetail from '../components/events/Eventdetail.vue'
import Article from '../pages/Article.vue'
import MyWriting from '../pages/MyWriting.vue'
import Learning from '../pages/Learning.vue'
import CourseDetail from '../pages/CourseDetail.vue'
import Lesson from '../pages/Lesson.vue'
import DraftEditor from '../pages/DraftEditor.vue'
import DraftPreview from '../pages/DraftPreview.vue'
import Profile from '../pages/Profile.vue'
import Settings from '../pages/Settings.vue'
import PublishedPost from '../pages/PublishedPost.vue'
import SearchResults from '../pages/SearchResults.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/set-password', name: 'SetPassword', component: SetPassword },
  { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPassword },
  { path: '/reset-password', name: 'ResetPassword', component: ResetPassword },

  // First-login onboarding — requires auth but must be outside the portal layout
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: Onboarding,
    meta: { requiresAuth: true },
  },

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
    path: '/my-writing/:id/preview',
    name: 'DraftPreview',
    component: DraftPreview,
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

// Public pages that anyone can browse: feed, article previews, and auth pages.
// Visitors can see the feed (enticement) but member-only actions are gated
// in-app by the login wall.
const PUBLIC_ROUTES = new Set(['Login', 'SetPassword', 'ForgotPassword', 'ResetPassword', 'Dashboard', 'Article', 'NotFound'])

router.beforeEach((to) => {
  const token = localStorage.getItem('portal_token')
  const isLoggedIn = !!token

  // Public pages are browsable without an account
  if (PUBLIC_ROUTES.has(to.name)) {
    return true
  }

  // Require login for member pages (remember where they were headed)
  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  const onboardingCompleted = localStorage.getItem('portal_onboarding_completed') === 'true'

  // If logged in and onboarding not yet completed, force onboarding
  // (except when already on the onboarding page or logging out)
  if (isLoggedIn && !onboardingCompleted && to.name !== 'Onboarding' && to.name !== 'Login') {
    return { name: 'Onboarding' }
  }

  // If logged in and onboarding done, send them away from auth pages to dashboard
  if (to.name === 'Login' && isLoggedIn && onboardingCompleted) {
    return { name: 'Dashboard' }
  }
})

export default router