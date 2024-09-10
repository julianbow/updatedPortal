<template>
  <div id="main-menu">
    <ul>
      <li v-for="item in navItems" :key="item.name">
        <RouterLink :to="item.url" @click.prevent="updateTitle(item.name)">
          <span class="icon" :class="{ filled: activeItem === item.name }"></span>
          <span class="text">{{ item.name }}</span>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<script>
import '../../assets/css/header.css';

export default {
  name: 'NavigationBar',
  data() {
    return {
      navItems: [
        { name: 'Home', url: '/home' },
        { name: 'Users', url: '/users' },
        { name: 'Devices', url: '/devices' },
        { name: 'Station Map', url: '/map' },
        { name: 'Applications', url: '/integrations' },
        { name: 'System Metrics', url: '/metrics' },
        { name: 'API Monitoring', url: '/apiMonitoring' },
        { name: 'Tools', url: '/tools' }
      ],
      activeItem: null
    };
  },
  methods: {
    updateTitle(name) {
      this.activeItem = name;
      this.$emit('update-title', name);
    }
  }
};
</script>