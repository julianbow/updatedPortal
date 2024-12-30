<template>
  <div id="qc-dashboard">
    <button class="button" @click="goBack">Back</button>
    <div class="tabs">
      <button
        :class="{ active: activeTab === 'tempest' }"
        @click="setTab('tempest')"
      >
        Tempest Data QC
      </button>
      <button
        :class="{ active: activeTab === 'cpo' }"
        @click="setTab('cpo')"
      >
        CPO QC
      </button>
    </div>

    <div class="tab-content">
      <TempestDataQC v-if="activeTab === 'tempest'" />
      <CPOQC v-else />
    </div>
  </div>
</template>

<script>
import TempestDataQC from './TempestDataQC.vue';
import CPOQC from './CPOQC.vue';

export default {
  name: 'App',
  data() {
    return {
      activeTab: 'tempest' // default tab
    }
  },
  components: {
    CPOQC,
    TempestDataQC,
  },
  methods: {
    goBack() {
      this.$router.push({ name: 'tools' });
    },
    updateTitle() {
      this.$emit("update-title", "QC Dashboard");
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
        if (newValue && (newValue === 'tempest' || newValue === 'cpo')) {
          this.activeTab = newValue;
        }
      }
    }
  },
  mounted() {
    this.updateTitle();
    // On mount, check if tab is in URL. If so, use that; else default to 'tempest'
    const tabFromUrl = this.$route.query.tab;
    if (tabFromUrl && (tabFromUrl === 'tempest' || tabFromUrl === 'cpo')) {
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
