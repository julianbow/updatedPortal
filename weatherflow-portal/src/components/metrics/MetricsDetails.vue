<template>
  <div id="metrics-data">
    <div class="back-button-container">
      <button class="button" @click="goBack">Back</button>
      <div id="search-form">
        <input
          id="search-box"
          type="text"
          v-model="searchQuery"
          placeholder="Search by Metric or Source"
        />
      </div>
    </div>
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
            <th @click="sortTable('name')">Metric <span class="sort" :class="getSortClass('name')"></span></th>
            <th @click="sortTable('source')">Source <span class="sort" :class="getSortClass('source')"></span></th>
            <th @click="sortTable('time')">Timestamp <span class="sort" :class="getSortClass('time')"></span></th>
            <th @click="sortTable('value')">Value <span class="sort" :class="getSortClass('value')"></span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(metric, index) in sortedMetrics" :key="index">
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
      v-if="selectedMetrics.length > 0 && loadChart"
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
        selectedTimeRange: "20160",
        selectedPeriod: "60",
        isLoading: false,
        loadChart: false,
        searchQuery: '',
        sortKey: 'name',
        sortDirection: 'asc',
      };
    },
    computed: {
      filteredMetrics() {
        if (!this.metricsData) {
          return [];
        }

        if (!this.searchQuery) {
          return this.metricsData;
        }

        const query = this.searchQuery.toLowerCase();
        return this.metricsData.filter(metric => {
          return metric.name.toLowerCase().includes(query) || metric.source.toLowerCase().includes(query);
        });
      },
      sortedMetrics() {
        return this.filteredMetrics.slice().sort((a, b) => {
          let modifier = this.sortDirection === 'asc' ? 1 : -1;
          if (a[this.sortKey] < b[this.sortKey]) return -1 * modifier;
          if (a[this.sortKey] > b[this.sortKey]) return 1 * modifier;
          return 0;
        });
      }
    },
    methods: {
      isMetricSelected(metric) {
        return this.selectedMetrics.includes(metric.chartName);
      },

      handleMetricClick(metric) {
        const existingIndex = this.selectedMetrics.findIndex((m) => m === metric.chartName);
        if (existingIndex === -1) {
          this.selectedMetrics = [...this.selectedMetrics, metric.chartName];
        } else {
          this.selectedMetrics = this.selectedMetrics.filter((m) => m !== metric.chartName);
        }
        this.updateUrl();
      },

      async showMetricsData(metric) {
        this.isLoading = true;
        try {
          const response = await this.requestor.makeMetricsDataRequest(metric);
          if (response.data.status.status_code === 0) {
            this.metricsData = this.buildMetricsObject(response.data.metrics, metric);
            this.loadChart = true;
          }
        } catch (error) {
          console.error("Error getting metrics:", error);
        } finally {
          this.isLoading = false;
        }
      },

      buildMetricsObject(metrics, metricName) {
        if (metricName === "swd-api") {
          const filteredMetrics = metrics.filter((metric) => metric.name.startsWith('swd-api.'));

          return filteredMetrics.map((metric) => {
            const nameParts = metric.name.split(".");

            return {
              name: nameParts[1],
              chartName: metric.name,
              source: nameParts[2],
              value: metric.value,
              time: Day.formatEpochTime(metric.timestamp),
              timestamp: metric.timestamp,
            };
          });
        } else {
          return metrics.map((metric) => {
            const nameParts = metric.name.split(".");
            return {
              name: nameParts[1],
              chartName: metric.name,
              source: nameParts[2],
              value: metric.value,
              time: Day.formatEpochTime(metric.timestamp),
              timestamp: metric.timestamp,
            };
        });
        }
      },

      updateUrl() {
        const encodedMetrics = this.selectedMetrics.join(',');

        this.$router.push({
          name: 'MetricsDetails',
          params: {
            metric: this.metric,
          },
          query: {
            timeRange: this.selectedTimeRange,
            period: this.selectedPeriod,
            metrics: encodedMetrics,
            search: this.searchQuery || '',
          }
        });
      },
      parseRouteParams() {
        if (this.$route.query.timeRange) {
          this.selectedTimeRange = this.$route.query.timeRange;
        }

        if (this.$route.query.period) {
          this.selectedPeriod = this.$route.query.period;
        }

        if (this.$route.query.metrics) {
          this.selectedMetrics = this.$route.query.metrics.split(',');
        }

        if (this.$route.query.search) {
          this.searchQuery = this.$route.query.search;
        }
      },
      sortTable(key) {
        if (this.sortKey === key) {
          this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          this.sortKey = key;
          this.sortDirection = 'asc';
        }
      },
      getSortClass(key) {
        return {
          up: this.sortDirection === 'asc' && this.sortKey === key,
        };
      },
      goBack() {
        this.$router.push({ name: 'metrics' });
      }
    },
    watch: {
      selectedTimeRange() {
        this.updateUrl();
      },
      selectedPeriod() {
        this.updateUrl();
      },
      searchQuery() {
        this.updateUrl();
      },
      '$route.query'() {
        this.updateUrl();
      }
    },
    mounted() {
      this.parseRouteParams();
      this.showMetricsData(this.metric);
    },
  };
</script>