<template>
  <!-- eslint-disable vue/no-multiple-template-root -->
    <AppHeader :title="selectedMenuTitle" />
    <NavigationBar @update-title="setMenuTitle" />
    <div id="content">
      <HomeView v-if="selectedMenuTitle === 'Home'" />
    </div>
    <!-- <UsersView v-else-if="selectedMenuTitle === 'Users'" />
    <DevicesView v-else-if="selectedMenuTitle === 'Devices'" />
    <StationMapView v-else-if="selectedMenuTitle === 'Station Map'" />
    <ApplicationsView v-else-if="selectedMenuTitle === 'Applications'" />
    <SystemMetricsView v-else-if="selectedMenuTitle === 'System Metrics'" />
    <ApiMonitoringView v-else-if="selectedMenuTitle === 'API Monitoring'" />
    <ToolsView v-else-if="selectedMenuTitle === 'Tools'" /> -->
  <!-- eslint-enable vue/no-multiple-template-root -->
</template>

<script>
  import AppHeader from './components/AppHeader.vue';
  import NavigationBar from './components/NavigationBar.vue';
  import HomeView from './components/HomeView.vue';

  export default {
    components: {
      AppHeader,
      NavigationBar,
      HomeView
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