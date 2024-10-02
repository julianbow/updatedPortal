<template>
    <div id="metrics" class="grid-list">
        <Loader :isLoading="isLoading"/>
        <ul v-if="metrics && !isLoading && !selectecMetric">
            <li v-for="(metric, index) in metrics" :key="index" class="metric-item" @click="showMetricsData(metric)">
            {{ metric }}
            </li>
        </ul>
        <MetricsDetails
            v-if="selectecMetric"
            :requestor="requestor"
            :metric="selectecMetric"
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
        selectecMetric: null,
        isLoading: false,
      };
    },
    methods: {
      async displayApplicationMenuGetData() {
        this.isLoading = true;

        const response = await this.requestor.makeMetricsRequest();
        try {
          if (response.data.status.status_code === 0) {
            this.metrics = response.data.metrics_names;
          } else {
            this.isLoading = false;
          }
        } catch (error) {
            console.error('Error getting metrics:', error);
            this.loading = false;
        } finally {
            this.isLoading = false;
        }
      },
      async showMetricsData(metric) {
        this.selectecMetric = metric;
      },
      updateTitle() {
        this.$emit('update-title', 'System Metrics');
      }
    },
    mounted() {
      this.updateTitle();
      this.displayApplicationMenuGetData();
    },
  }
  </script>