import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import HomeView from '@/views/HomeView.vue';
import UsersView from '@/views/UsersView.vue';
import DevicesView from '@/views/DevicesView.vue';
import MapView from '@/views/MapView.vue';
import ApplicationsView from '@/views/ApplicationsView.vue';
import MetricsView from '@/views/MetricsView.vue';
import M3Dashboard from '@/views/M3Dashboard.vue';
import ApiMonitorView from '@/views/ApiMonitorView.vue';
import ToolsView from '@/views/ToolsView.vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import OnlineOfflineChart from '@/components/home/OnlineOfflineChart.vue';
import FirmwareNightly from '@/components/tools/firmware/FirmwareNightly.vue';
import FirmwareList from '@/components/tools/firmware/FirmwareList.vue';
import QCView from '@/components/tools/qc/QCView.vue';
import NetworkManagementView from '@/components/tools/network-management/NetworkManagementView.vue';

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
      path: '/online-offline',
      name: 'onlineOffline',
      component: OnlineOfflineChart,
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
      path: '/:metric',
      name: 'MetricsDetails',
      component: MetricsView,
      props: (route) => ({
        metric: route.params.metric,
        timeRange: route.query.timeRange || '20160',
        period: route.query.period || '60',
        metrics: route.query.metrics || '',
        searchQuery: route.query.search || ''
      }),
      meta: { requiresAuth: true }
    },
    {
      path: '/m3-dashboard',
      name: "M3Dashboard",
      component: M3Dashboard,
      meta: { requiresAuth: true },
    },
    {
      path: "/monitoring",
      name: "monitoring",
      component: ApiMonitorView,
      meta: { requiresAuth: true },
    },
    {
      path: "/tools",
      name: "tools",
      component: ToolsView,
      meta: { requiresAuth: true },
    },
    {
      path: "/tools/firmware-nightly",
      name: "firmwareNightly",
      component: FirmwareNightly,
      meta: { requiresAuth: true },
    },
    {
      path: "/tools/firmware-list",
      name: "firmwareList",
      component: FirmwareList,
      meta: { requiresAuth: true },
    },
    {
      path: "/tools/qc-dashboard",
      name: "qcDashboard",
      component: QCView,
      meta: { requiresAuth: true },
    },
    {
      path: "/tools/network-management",
      name: "networkManagement",
      component: NetworkManagementView,
      meta: { requiresAuth: true },
    },
    {
      path: '/tools/network-management/:tab?',
      name: 'networkManagement',
      component: NetworkManagementView,
      meta: { requiresAuth: true },
      props: true, // Pass the tab parameter as a prop
    },
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
