<template>
    <div id="m3-dashboard" class="grid-list">
      <Loader :isLoading="isLoading" />

      <div class="metrics-summary">
        <div
          class="metric-card"
          v-for="metric in metrics"
          :key="metric.id"
        >
          <span class="title">{{ metric.title }}</span>
          <div class="value">{{ metric.value }}</div>
          <div
            :class="['change', metric.change > 0 ? 'positive' : 'negative']"
          >
            {{ metric.change > 0 ? '▲' : '▼' }} {{ Math.abs(metric.change) }}%
          </div>
        </div>
      </div>

      <div class="chart">
        <canvas id="line-chart"></canvas>
      </div>
    </div>
  </template>

  <script>
  import Requestor from '@/helpers/Requestor';
  import Loader from '@/components/Loader.vue';
  import "../assets/css/metrics.css";

  export default {
    components: {
      Loader,
    },
    data() {
      return {
        isLoading: false,
        metrics: [
          { id: 1, metric_name: "mmm.hubs_ever_installed_count.swd-ps02", title: 'Hubs Installed', value: 0, change: 0 },
          { id: 2, metric_name: "mmm.hubs_reporting_count.swd-ps02", title: 'Hubs Reporting', value: 0, change: 0 },
          { id: 3, metric_name: "mmm.devices_reporting_count.swd-ps02", title: 'Devices Reporting', value: 0, change: 0 },
        //   { id: 4, metric_name: "mmm.devices_reporting_count.swd-ps02", title: 'Sensor Failures', value: 0, change: 0 },
        ],
      };
    },
    methods: {
      async fetchMetrics() {
        this.isLoading = true;
        try {
          // Iterate over each metric to fetch data
          for (let i = 0; i < this.metrics.length; i++) {
            console.log(`Fetching data for metric: ${this.metrics[i].metric_name}`);
            // const response = await this.fetchMetricData(this.metrics[i].title);
            // this.metrics[i].value = response.value;
            // this.metrics[i].change = response.change;
          }
        } catch (error) {
          console.error('Error fetching metrics:', error);
        } finally {
          this.isLoading = false;
        }
      },
      fetchMetricData(metricTitle) {
        console.log(`Fetching data for metric: ${metricTitle}`);
      },
    },
    mounted() {
      this.$emit('update-title', 'M3 Dashboard');
      this.fetchMetrics();
    },
  };
  </script>

  <style scoped>
  #m3-dashboard {
    margin: 80px 20px;
    padding: 20px;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .metrics-summary {
    display: flex;
    justify-content: space-between;
    margin: 20px;
  }

  .metric-card {
    background: white;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
    width: 20%;
  }

  .metric-card .title {
    font-size: 14px;
    color: #555;
  }

  .metric-card .value {
    font-size: 24px;
    font-weight: bold;
    color: #333;
  }

  .metric-card .change {
    font-size: 12px;
    margin-top: 5px;
  }

  .metric-card .change.positive {
    color: green;
  }

  .metric-card .change.negative {
    color: red;
  }

  .chart {
    margin: 20px;
    background: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
  }

  .failure-section {
    margin: 20px;
  }

  .failure-section h2 {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .failure-metrics {
    display: flex;
    justify-content: space-between;
  }

  .failure-card {
    background: white;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
    width: 30%;
  }
  </style>
