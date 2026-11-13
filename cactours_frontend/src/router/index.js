import { createRouter, createWebHistory } from 'vue-router'
import { getAccessToken } from '@/api/httpClient'
import HomeView from '@/views/HomeView.vue'
import ToursCatalogView from '@/views/ToursCatalogView.vue'
import TourDetailView from '@/views/TourDetailView.vue'
import BookingCheckoutView from '@/views/BookingCheckoutView.vue'
import UserProfileView from '@/views/UserProfileView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/tours', name: 'tours-catalog', component: ToursCatalogView },
  { path: '/tours/:id', name: 'tour-detail', component: TourDetailView },
  {
    path: '/reservar/:tourId',
    name: 'booking-checkout',
    component: BookingCheckoutView,
    meta: { requiresAuth: true },
  },
  {
    path: '/mi-perfil',
    name: 'user-profile',
    component: UserProfileView,
    meta: { requiresAuth: true },
  },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/registro', name: 'register', component: RegisterView },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth && !getAccessToken()) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
