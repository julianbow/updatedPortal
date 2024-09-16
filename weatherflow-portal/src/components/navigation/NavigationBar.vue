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
    <span @click.prevent="logOut()" class="logout-btn">Log Out</span>
  </div>
</template>

<script>
import '../../assets/css/header.css';

export default {
  name: 'NavigationBar',
  props: {
    selectedMenuTitle: {
      type: String,
      required: false,
      default: ''
    }
  },
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
    },
    setActive(itemName) {
      this.activeItem = itemName;
    },
    logOut() {
      this.$emit('log-out');
    }
  },
  watch: {
    selectedMenuTitle(newTitle) {
      this.setActive(newTitle);
    }
  },
  mounted() {
    this.setActive(this.selectedMenuTitle);
  }
};
</script>
