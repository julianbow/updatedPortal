<template>
    <div id="metrics" class="grid-list">
      <ul v-if="metrics">
        <li v-for="(metric, index) in metrics" :key="index" class="metric-item" @click="getMetricsData(metric)">
          {{ metric }}
        </li>
      </ul>
      <p v-else>Loading metrics...</p>
    </div>
  </template>

  <script>
  import Requestor from '@/helpers/Requestor';
  import "../assets/css/metrics.css";

  export default {
    data() {
      return {
        requestor: new Requestor(),
        metrics: null,
      };
    },
    methods: {
      async displayApplicationMenuGetData() {
        const response = await this.requestor.makeMetricsRequest();
        try {
          if (response.data.status.status_code === 0) {
            this.metrics = response.data.metrics_names;
          }
        } catch (error) {
          console.error('Error getting metrics:', error);
        }
      },
      async getMetricsData(metric) {
        const response = await this.requestor.makeMetricsDataRequest(metric);
        try {
          if (response.data.status.status_code === 0) {
            console.log(response)
          }
        } catch (error) {
          console.error('Error getting metrics:', error);
        }
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