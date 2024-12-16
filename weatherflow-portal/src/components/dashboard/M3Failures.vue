<template>
    <div class="failure-section">
      <!-- Highest Failure Rates Section -->
      <h2>Highest Failure Rates</h2>
      <div class="failure-metrics">
        <div
          class="failure-card"
          v-for="metric in topFailures"
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
          <MiniGraph :data="metric.data" :color="metric.color" />
        </div>
      </div>

      <!-- Trending Failure Rates Section -->
      <h2>Trending Failure Rates</h2>
      <div class="failure-metrics">
        <div
          class="failure-card"
          v-for="metric in trendingFailures"
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
          <MiniGraph :data="metric.data" :color="metric.color" />
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
        topFailures() {
            return [...this.metrics]
            .filter((metric) => Array.isArray(metric.data) && metric.data.length > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 3);
        },
        trendingFailures() {
        return [...this.metrics]
            .filter((metric) =>
                Array.isArray(metric.data) &&
                metric.data.length > 0
            )
            // the top 3 highest positive changes
            .filter(metric => metric.trendDirection === "up")

            // Sort by absolute change to show largest shifts in either direction:
            .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
            .slice(0, 3); // Top 3 by highest percent change
    },
    },

    methods: {
        async fetchFailureMetrics() {
            try {
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

                metric.change = firstValue !== 0
                    ? ((lastValue - firstValue) / firstValue) * 100
                    : 0;

                metric.trendDirection = lastValue > firstValue ? "up" : "down";
                }
            }
            } catch (error) {
            console.error("Error fetching failure metrics:", error);
            } finally {
            this.loading = false;
            }
        },
      formatNumber(value) {
        return typeof value === "number" ? new Intl.NumberFormat().format(value) : value;
      },
    },
    mounted() {
      this.fetchFailureMetrics();
    },
  };
  </script>

  <style scoped>
    h2 {
        font-size: 20px;
    }

    .failure-section {
        margin: 20px;
    }

    .failure-metrics {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-evenly;
        gap: 10px;
    }

    .failure-card {
        background: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        text-align: left;
        width: calc(25% - 10px);
        position: relative;
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
    margin-top: 10px;
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
        margin: 10px 0;
    }
  </style>