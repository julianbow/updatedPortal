<template>
  <!-- eslint-disable vue/no-multiple-template-root -->
    <AppHeader :title="selectedMenuTitle" />
    <NavigationBar @update-title="setMenuTitle" />
    <div id="content">
      <HomeView v-if="selectedMenuTitle === 'Home'" />
      <UsersView v-else-if="selectedMenuTitle === 'Users'" />
    </div>
  <!-- eslint-enable vue/no-multiple-template-root -->
</template>

<script>
import AppHeader from './components/AppHeader.vue';
import NavigationBar from './components/NavigationBar.vue';
import HomeView from './views/HomeView.vue';
import UsersView from './views/UsersView.vue';

export default {
  components: {
    AppHeader,
    NavigationBar,
    HomeView,
    UsersView,
  },
  data() {
    return {
      selectedMenuTitle: 'Home'
    };
  },
  methods: {
    setMenuTitle(title) {
      this.selectedMenuTitle = title;
    }
  }
}
</script>