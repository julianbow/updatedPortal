import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import UsersView from '@/views/UsersView.vue';
import LoginView from '@/views/LoginView.vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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
      path: '/users/search/:term',
      name: 'searchResults',
      component: UsersView,
      meta: { requiresAuth: true },
    },
  ],
});

// Navigation guard to check for authenticated users
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  let currentUser = getStoredUser();

  // If no user is found in localStorage, check Firebase Auth
  if (!currentUser) {
    currentUser = await getCurrentUser();

    // If we get a user from Firebase, store it in localStorage
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify(currentUser));
    }
  }

  // Redirect logic based on authentication
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
