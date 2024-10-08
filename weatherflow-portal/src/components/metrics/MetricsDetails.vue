<template>
    <div id="metrics-data">
      <Loader :isLoading="isLoading" />
      <div class="metrics-header">
        <h1>{{ metric }}</h1>
        <div class="timerange-selector">
          Time Range:
          <select v-model="selectedTimeRange">
            <option value="10080">Last 1 Week</option>
            <option value="20160">Last 2 Weeks</option>
            <option value="40320">Last 4 Weeks</option>
            <option value="120960">Last 26 Weeks</option>
            <option value="564480">Last 1 Year</option>
          </select>
          Period:
          <select v-model="selectedPeriod">
            <option value="1">1 Minute</option>
            <option value="10">10 Minutes</option>
            <option value="60">1 Hour</option>
          </select>
        </div>
      </div>

      <div id="metrics-list">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Metric</th>
              <th>Source</th>
              <th>Timestamp</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="metric in metricsData" :key="metric.name">
              <td>
                <input
                  type="checkbox"
                  :checked="isMetricSelected(metric)"
                  @change="handleMetricClick(metric)"
                />
              </td>
              <td>{{ metric.name }}</td>
              <td>{{ metric.source }}</td>
              <td>{{ metric.time }}</td>
              <td>{{ metric.value }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <MetricsChart
        v-if="selectedMetrics.length > 0"
        :metrics="selectedMetrics"
        :timeRange="selectedTimeRange"
        :period="selectedPeriod"
        :requestor="requestor"
      />
    </div>
  </template>

  <script>
    import Loader from '../Loader.vue';
    import MetricsChart from './MetricsChart.vue';
    import Day from '../../helpers/Day';

    export default {
      components: {
        Loader,
        MetricsChart,
      },
      props: {
        metric: String,
        requestor: Object,
      },
      data() {
        return {
          metricsData: null,
          selectedMetrics: [],
          selectedTimeRange: "20160", // Default to 2 Weeks
          selectedPeriod: "60", // Default to 1 Hour
          isLoading: false,
        };
      },
      methods: {
        isMetricSelected(metric) {
          return this.selectedMetrics.includes(metric.chartName);
        },

        handleMetricClick(metric) {
          const existingIndex = this.selectedMetrics.findIndex(
            (m) => m === metric.chartName
          );
          if (existingIndex === -1) {
            this.selectedMetrics = [...this.selectedMetrics, metric.chartName];
          } else {
            this.selectedMetrics = this.selectedMetrics.filter(
              (m) => m !== metric.chartName
            );
          }
          this.updateUrl();
        },

        async showMetricsData(metric) {
          this.isLoading = true;
          try {
            const response = await this.requestor.makeMetricsDataRequest(metric);
            if (response.data.status.status_code === 0) {
              this.metricsData = this.buildMetricsObject(response.data.metrics);
            }
          } catch (error) {
            console.error("Error getting metrics:", error);
          } finally {
            this.isLoading = false;
          }
        },

        buildMetricsObject(metrics) {
          return metrics.map((metric) => {
            const nameParts = metric.name.split(".");
            return {
              name: nameParts[1],
              chartName: metric.name,
              source: nameParts[nameParts.length - 1],
              value: metric.value,
              time: Day.formatEpochTime(metric.timestamp),
              timestamp: metric.timestamp,
            };
          });
        },

        updateUrl() {
          if (this.selectedMetrics.length === 0) {
            this.$router.push({
              name: 'MetricsView',
              params: {
                metric: this.metric,
              }
             });
          } else {
            const encodedMetric = this.metric;
            const encodedMetrics = this.selectedMetrics.join(',');

            this.$router.push({
              name: 'MetricsDetails',
              params: {
                metric: encodedMetric,
                timeRange: this.selectedTimeRange,
                period: this.selectedPeriod,
                metrics: encodedMetrics
              }
            });

          }
        },
        parseRouteParams() {
          if (this.$route.params.timeRange) {
            this.selectedTimeRange = this.$route.params.timeRange;
          }
          if (this.$route.params.period) {
            this.selectedPeriod = this.$route.params.period;
          }
          if (this.$route.params.metrics) {
            this.selectedMetrics = this.$route.params.metrics.split(',');
          }
        }
      },
      watch: {
        selectedTimeRange() {
          this.updateUrl();
        },
        selectedPeriod() {
          this.updateUrl();
        },
        '$route.params'() {
          this.parseRouteParams();
          this.updateUrl();
          this.showMetricsData(this.metric);
        }
      },
      mounted() {
        this.parseRouteParams();
        this.showMetricsData(this.metric);
      },
    };
  </script>
