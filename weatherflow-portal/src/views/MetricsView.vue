<template>
  <div id="metrics" class="grid-list">
    <Loader :isLoading="isLoading"/>
    <ul v-if="sortedMetrics && !isLoading && !selectedMetric">
      <li v-for="(metric, index) in sortedMetrics" :key="index" class="metric-item" @click="showMetricsData(metric)">
        {{ metric }}
      </li>
    </ul>
    <MetricsDetails
      v-if="selectedMetric"
      :requestor="requestor"
      :metric="selectedMetric"
    />
  </div>
</template>

<script>
import Requestor from '@/helpers/Requestor';
import Loader from '@/components/Loader.vue';
import MetricsDetails from '@/components/metrics/MetricsDetails.vue';
import "../assets/css/metrics.css";

export default {
  components: {
    Loader,
    MetricsDetails
  },
  data() {
    return {
      requestor: new Requestor(),
      metrics: null,
      selectedMetric: null,
      isLoading: false,
    };
  },
  computed: {
    sortedMetrics() {
      if (!this.metrics) return [];
      return this.metrics.slice().sort((a, b) => a.localeCompare(b));
    }
  },
  methods: {
    async displayApplicationMenuGetData() {
      this.isLoading = true;

      try {
        const response = await this.requestor.makeMetricsRequest();

        if (response.data.status.status_code === 0) {
          this.metrics = response.data.metrics_names;
        } else {
          this.isLoading = false;
        }
      } catch (error) {
        console.error('Error getting metrics:', error);
        this.isLoading = false;
      } finally {
        this.isLoading = false;
      }
    },
    async showMetricsData(metric) {
      this.$router.push({ path: `/metrics/${metric}` });
      this.selectedMetric = metric;
    },
    updateTitle() {
      this.$emit('update-title', 'System Metrics');
    }
  },
  watch: {
    '$route.params.metric'(newMetric) {
      if (newMetric) {
        this.selectedMetric = newMetric;
        this.showMetricsData(newMetric);
      } else {
        this.selectedMetric = null;
        this.displayApplicationMenuGetData();
      }
    },
  },
  mounted() {
    this.updateTitle();

    const metricFromRoute = this.$route.params.metric;
    if (metricFromRoute) {
      this.showMetricsData(metricFromRoute);
    } else {
      this.displayApplicationMenuGetData();
    }
  },
}
</script>
