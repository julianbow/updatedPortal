<template>
  <div>
    <!-- Show the login page if the user is not authenticated -->
    <LoginView v-if="!isAuthenticated" />

    <!-- Show the main app if the user is authenticated -->
    <div v-else>
      <AppHeader :title="selectedMenuTitle" />
      <NavigationBar :selectedMenuTitle="selectedMenuTitle" @update-title="setMenuTitle" />
      <div id="content">
        <RouterView @update-title="setMenuTitle" />
      </div>
    </div>
  </div>
</template>

<script>
import { onAuthStateChanged, signOut } from "firebase/auth"; // Firebase auth functions
import { auth } from '../firebase.js'; // Firebase auth instance
import AppHeader from './components/navigation/AppHeader.vue';
import NavigationBar from './components/navigation/NavigationBar.vue';
import LoginView from './views/LoginView.vue'; // Your login component

export default {
  components: {
    AppHeader,
    NavigationBar,
    LoginView,
  },
  data() {
    return {
      selectedMenuTitle: '',
      isAuthenticated: false, // Authentication state
    };
  },
  methods: {
    setMenuTitle(title) {
      this.selectedMenuTitle = title;
    },
    logout() {
      signOut(auth).then(() => {
        this.isAuthenticated = false;
      }).catch((error) => {
        console.error("Error during logout:", error);
      });
    }
  },
  mounted() {
    // Listen for changes to authentication state
    onAuthStateChanged(auth, (user) => {
      this.isAuthenticated = !!user;
    });
  }
};
</script>
