import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import HomeView from '@/views/HomeView.vue';
import UsersView from '@/views/UsersView.vue';
import DevicesView from '@/views/DevicesView.vue';
import MapView from '@/views/MapView.vue';
import ApplicationsView from '@/views/ApplicationsView.vue';
import MetricsView from '@/views/MetricsView.vue';
import ApiMonitorView from '@/views/ApiMonitorView.vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import MetricsDetails from '@/components/metrics/MetricsDetails.vue';

const auth = getAuth();

// Helper function to get the current user from Firebase with a promise
function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
}

// Helper function to get the stored user from localStorage
function getStoredUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/',
      name: 'root',
      redirect: '/home',
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
      meta: { requiresAuth: true },
    },
    {
      path: '/users/:userId',
      name: 'UserInfo',
      component: UsersView,
      meta: { requiresAuth: true },
    },
    {
      path: '/users/search/:userTerm',
      name: 'userSearchResults',
      component: UsersView,
      meta: { requiresAuth: true },
    },
    {
      path: '/devices',
      name: 'devices',
      component: DevicesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/devices/:filter/:deviceTerm',
      name: 'devicesSearchResults',
      component: DevicesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/map',
      name: 'map',
      component: MapView,
      meta: { requiresAuth: true },
    },
    {
      path: '/map/:lat?/:lon?/:zoom?',
      name: 'MapView',
      component: MapView,
      meta: { requiresAuth: true },
    },
    {
      path: '/applications',
      name: 'applications',
      component: ApplicationsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/metrics',
      name: 'metrics',
      component: MetricsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/metrics/:metric',
      name: "MetricsView",
      component: MetricsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/metrics/:metric/:timeRange/:period/:metrics',
      name: 'MetricsDetails',
      component: MetricsView,
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: "/monitoring",
      name: "monitoring",
      component: ApiMonitorView,
      meta: { requiresAuth: true },
    }
  ],
});

// Navigation guard to check for authenticated users
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  let currentUser = getStoredUser();

  if (!currentUser) {
    currentUser = await getCurrentUser();

    if (currentUser) {
      localStorage.setItem('user', JSON.stringify(currentUser));
    }
  }

  if (requiresAuth && !currentUser) {
    next('/login');
  } else if (to.path === '/login' && currentUser) {
    next('/');
  } else if (to.path === "/" && !currentUser) {
    next('/login');
  } else {
    next();
  }
});

export default router;
