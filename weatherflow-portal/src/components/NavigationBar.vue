<template>
  <div id="main-menu">
    <ul>
      <li v-for="item in navItems" :key="item.name">
        <a href="#" @click.prevent="updateTitle(item.name)">
          <span class="icon"></span>
          <span class="text">{{ item.name }}</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
  import '../assets/css/header.css';

  export default {
    name: 'NavigationBar',
    data() {
      return {
        navItems: [
          { name: 'Home', url: '/sw/home' },
          { name: 'Users', url: '/sw/users' },
          { name: 'Devices', url: '/sw/devices' },
          { name: 'Station Map', url: '/sw/map' },
          { name: 'Applications', url: '/sw/integrations' },
          { name: 'System Metrics', url: '/sw/metrics' },
          { name: 'API Monitoring', url: '/sw/apiMonitoring' },
          { name: 'Tools', url: '/sw/tools' }
        ]
      };
    },
    methods: {
      updateTitle(name) {
        this.$emit('update-title', name);
      }
    }
  };
</script>