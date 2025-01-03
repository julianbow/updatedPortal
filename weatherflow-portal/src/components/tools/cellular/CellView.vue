<template>
    <div id="qc-dashboard">
      <button class="button" @click="goBack">Back</button>
      <div class="tabs">
        <button :class="{ active: activeTab === 'info' }" @click="setTab('info')">Cell Hub Info</button>
        <button :class="{ active: activeTab === 'report' }" @click="setTab('report')">Cell Hub Report</button>
      </div>

      <div class="tab-content">
        <CellInfo v-if="activeTab === 'info'" />
        <CellReport v-else />
      </div>
    </div>
  </template>

<script>
import CellInfo from './CellInfo.vue';
import CellReport from './CellReport.vue';

export default {
  name: 'App',
  data() {
    return {
      activeTab: 'info' // default tab
    }
  },
  components: {
    CellReport,
    CellInfo,
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'tools' });
    },
    updateTitle() {
      this.$emit("update-title", "Cellular Dashboard");
    },
    setTab(tabName) {
      this.activeTab = tabName;
      // Update the URL query without leaving the page
      this.$router.push({ query: { ...this.$route.query, tab: tabName } });
    }
  },
  watch: {
    // If you also want to handle directly changing tab by URL (optional)
    '$route.query.tab': {
      immediate: true,
      handler(newValue) {
        if (newValue && (newValue === 'info' || newValue === 'report')) {
          this.activeTab = newValue;
        }
      }
    }
  },
  mounted() {
    this.updateTitle();
    // On mount, check if tab is in URL. If so, use that; else default to 'info'
    const tabFromUrl = this.$route.query.tab;
    if (tabFromUrl && (tabFromUrl === 'info' || tabFromUrl === 'report')) {
      this.activeTab = tabFromUrl;
    } else {
      // set default tab in the URL if not present
      this.$router.replace({ query: { ...this.$route.query, tab: this.activeTab } });
    }
  },
}
</script>

<style scoped>
#qc-dashboard {
    margin: 80px 20px;
    padding: 20px;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tabs {
    display: flex;
    justify-content: center;
    border-bottom: 1px solid #ccc;
}

.tabs button {
    padding: 10px 20px;
    border: none;
    background: none;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    font-size: 16px;
    color: #512b59;
}

.tabs button.active {
    border-bottom: 2px solid #512b59;
    font-weight: bold;
}

.tab-content {
    padding: 20px 0;
}
</style>
