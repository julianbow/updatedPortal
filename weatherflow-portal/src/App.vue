<template>
  <!-- eslint-disable vue/no-multiple-template-root -->
    <AppHeader :title="selectedMenuTitle" />
    <NavigationBar :selectedMenuTitle="selectedMenuTitle" @update-title="setMenuTitle" />
    <div id="content">
      <RouterView @update-title="setMenuTitle" />
    </div>
  <!-- eslint-enable vue/no-multiple-template-root -->
</template>

<script>
import AppHeader from './components/navigation/AppHeader.vue';
import NavigationBar from './components/navigation/NavigationBar.vue';


export default {
  components: {
    AppHeader,
    NavigationBar,
  },
  data() {
    return {
      selectedMenuTitle: ''
    };
  },
  methods: {
    setMenuTitle(title) {
      this.selectedMenuTitle = title;
    }
  }
}
</script>