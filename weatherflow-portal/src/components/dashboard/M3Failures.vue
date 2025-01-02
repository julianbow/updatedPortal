<template>
  <div class="failure-section">
    <div class="failure-hdr">
      <h2>Sensor Failure Rates</h2>
      <div>
        <label for="sortFilter">Sort by:</label>
        <select id="sortFilter" v-model="selectedSortOption" @change="sortFailures">
          <option value="highest">Highest to Lowest</option>
          <option value="trending">Trending</option>
        </select>
      </div>
    </div>
    <div class="failure-metrics-wrapper" ref="scrollWrapper">
      <div class="failure-metrics">
        <div
          class="failure-card"
          v-for="metric in sortedFailures"
          :key="metric.id"
        >
          <div class="metric-header">
            <span class="metric-title">{{ metric.title }}</span>
            <div
              class="metric-change"
              :class="{ positive: metric.trendDirection === 'down', negative: metric.trendDirection === 'up' }"
            >
              <span v-if="metric.trendDirection === 'up'">▲ {{ Math.abs(metric.change).toFixed(1) }}%</span>
              <span v-else-if="metric.trendDirection === 'down'">▼ {{ Math.abs(metric.change).toFixed(1) }}%</span>
              <span v-else>0%</span>
            </div>
          </div>
          <div class="metric-value">{{ formatNumber(metric.value) }}</div>
          <MiniGraph
            v-if="!loading"
            :data="metric.data"
            :color="metric.color"
            :maxY="highestFailureCount"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MiniGraph from "@/components/dashboard/MiniGraph.vue";

export default {
  props: {
    requestor: {
      type: Object,
      required: true,
    },
    selectedTimeRange: {
      type: String,
      required: true,
    },
    selectedPeriod: {
      type: String,
      required: true,
    },
  },
  components: {
    MiniGraph,
  },
  data() {
    return {
      loading: true,
      selectedSortOption: "highest",
      highestFailureCount: 0,
      metrics: [
        {
          id: 1,
          metric_name: "mmm.sensor_fail_humidity_count.swd-ps02",
          title: "Humidity",
          color: "rgba(142, 142, 142, 1)",
          value: 0,
          change: 0,
          clicked: false,
        },
        {
          id: 2,
          metric_name: "mmm.sensor_fail_lightning_count.swd-ps02",
          title: "Lightning",
          color: "rgba(90, 197, 68, 1)",
          value: 0,
          change: 0,
          clicked: false,
        },
        {
          id: 3,
          metric_name: "mmm.sensor_fail_pressure_count.swd-ps02",
          title: "Pressure",
          color: "rgba(89, 163, 248, 1)",
          value: 0,
          change: 0,
          clicked: false,
        },
        {
          id: 4,
          metric_name: "mmm.sensor_fail_rain_count.swd-ps02",
          title: "Rain",
          color: "rgba(255, 165, 0, 1)",
          value: 0,
          change: 0,
          clicked: false,
        },
        {
          id: 5,
          metric_name: "mmm.sensor_fail_sunlight_count.swd-ps02",
          title: "Sunlight",
          color: "rgba(255, 215, 0, 1)",
          value: 0,
          change: 0,
          clicked: false,
        },
        {
          id: 6,
          metric_name: "mmm.sensor_fail_temp_count.swd-ps02",
          title: "Temperature",
          color: "rgba(255, 99, 71, 1)",
          value: 0,
          change: 0,
          clicked: false,
        },
        {
          id: 7,
          metric_name: "mmm.sensor_fail_wind_count.swd-ps02",
          title: "Wind",
          color: "rgba(0, 0, 255, 1)",
          value: 0,
          change: 0,
          clicked: false,
        },
      ],
    };
  },
  computed: {
    sortedFailures() {
      if (this.selectedSortOption === "highest") {
        return [...this.metrics]
          .filter((metric) => Array.isArray(metric.data) && metric.data.length > 0)
          .sort((a, b) => b.value - a.value);
      } else if (this.selectedSortOption === "trending") {
        return [...this.metrics]
          .filter((metric) => Array.isArray(metric.data) && metric.data.length > 0)
          .sort((a, b) => {
            if (b.trendDirection === "up" && a.trendDirection !== "up") return 1;
            if (a.trendDirection === "up" && b.trendDirection !== "up") return -1;
            return Math.abs(b.change) - Math.abs(a.change);
          });
      }
      return this.metrics;
    },
  },
  methods: {
    async fetchFailureMetrics() {
      this.loading = true;
      try {
        let maxFailure = 0;
        for (let metric of this.metrics) {
          const response = await this.requestor.makeMetricsChartDataRequest(
            metric.metric_name,
            this.selectedPeriod,
            this.selectedTimeRange
          );
          const values = response.data.values;

          if (Array.isArray(values) && values.length > 0) {
            metric.data = values.map((val) => parseFloat(val.split(",")[1]));
            const lastValue = metric.data[metric.data.length - 1];
            const firstValue = metric.data[0];

            metric.value = lastValue;
            metric.change =
              firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
            metric.trendDirection = lastValue > firstValue ? "up" : "down";

            // Track the maximum failure value
            if (lastValue > maxFailure) {
              maxFailure = lastValue;
            }
          } else {
            // Reset if no data
            metric.data = [];
            metric.value = 0;
            metric.change = 0;
            metric.trendDirection = null;
          }
        }

        // Update highestFailureCount
        this.highestFailureCount = Math.ceil(maxFailure / 1000) * 1000;
      } catch (error) {
        console.error("Error fetching failure metrics:", error);
      } finally {
        this.loading = false;
      }
    },
    sortFailures() {
      // Trigger reactivity manually if necessary
    },
    formatNumber(value) {
      return typeof value === "number" ? new Intl.NumberFormat().format(value) : value;
    },
  },
  mounted() {
    this.fetchFailureMetrics();
  },
  watch: {
    selectedPeriod: {
      immediate: true,
      handler() {
        this.fetchFailureMetrics();
      }
    },
    selectedTimeRange: {
      immediate: true,
      handler() {
        this.fetchFailureMetrics();
      }
    }
  }
};
</script>

<style scoped>
  h2 {
    font-size: 20px;
  }

  .failure-section {
    margin: 20px;
  }

  .failure-hdr {
    display: flex;
    justify-content: space-between;
  }

  .failure-metrics-wrapper {
    overflow-x: hidden;
    padding: 5px 5px;
    flex-grow: 1;
    position: relative;
  }

  .failure-metrics-wrapper:hover {
    overflow-x: auto;
  }

  .failure-metrics-wrapper::-webkit-scrollbar {
    height: 8px;
    background: transparent;
  }

  .failure-metrics-wrapper:hover::-webkit-scrollbar {
    background: rgba(0, 0, 0, 0.1);
  }

  .failure-metrics-wrapper::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.5);
    border-radius: 4px;
  }

  .failure-metrics-wrapper:hover::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.7);
  }

  .failure-metrics {
    display: flex;
    flex-wrap: nowrap;
    margin-top: 10px;
    gap: 15px;
  }

  .failure-card {
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: left;
    width: 250px;
    flex-shrink: 0;
  }

  .metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .metric-value {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin-bottom: 10px;
  }

  .metric-change {
    font-size: 14px;
    font-weight: bold;
    display: inline-block;
  }

  .metric-change.positive {
    color: green;
  }

  .metric-change.negative {
    color: red;
  }

  .mini-graph {
    width: 100%;
    height: 50px;
    margin: 5px 0;
  }
</style>