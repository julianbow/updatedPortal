<template>
  <div>
    <!-- Wait until auth check is complete -->
    <div v-if="!isAuthChecked">
      <!-- Optional: Include a loading spinner or message here -->
    </div>

    <!-- Render content after auth check -->
    <div v-else>
      <!-- Show header and navigation if authenticated -->
      <div v-if="isAuthenticated">
        <AppHeader :title="selectedMenuTitle" />
        <NavigationBar
          :selectedMenuTitle="selectedMenuTitle"
          @update-title="setMenuTitle"
          @log-out="logout"
        />
      </div>

      <!-- Render the router view -->
      <div id="content" :class="{ login: isAuthenticated === false }">
        <RouterView @update-title="setMenuTitle" />
      </div>
    </div>
  </div>
</template>

<script>
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from '../firebase.js';
import AppHeader from './components/navigation/AppHeader.vue';
import NavigationBar from './components/navigation/NavigationBar.vue';
import LoginView from './views/LoginView.vue';

export default {
  components: {
    AppHeader,
    NavigationBar,
    LoginView,
  },
  data() {
    return {
      selectedMenuTitle: '',
      isAuthenticated: false,
      isAuthChecked: false,
    };
},
  methods: {
    setMenuTitle(title) {
      this.selectedMenuTitle = title;
    },
    logout() {
      signOut(auth).then(() => {
        this.isAuthenticated = false;
        this.$router.push('/login');
      }).catch((error) => {
        console.error("Error during logout:", error);
      });
    }
  },
  mounted() {
    onAuthStateChanged(auth, (user) => {
      this.isAuthenticated = !!user;
      this.isAuthChecked = true;
    });
},

};
</script>
