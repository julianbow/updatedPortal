<template>
    <div id="m3-dashboard" class="grid-list">
      <Loader :isLoading="isLoading" />

      <div class="metrics-summary">
        <div
            class="metric-card"
            v-for="metric in metricsSummary"
            :key="metric.id"
            >
            <div class="color-indicator" :style="{ backgroundColor: metric.color }"></div>
            <span class="title">{{ metric.title }}</span>
            <div class="value">{{ metric.value }}</div>
            <div
                :class="[
                'change',
                metric.change > 0
                    ? 'positive'
                    : metric.change < 0
                    ? 'negative'
                    : 'neutral'
                ]"
            >
                <!-- Special condition for Sensor Failures -->
                <template v-if="metric.title === 'Sensor Failures'">
                <span v-if="metric.change > 0" style="color: red;">▲ {{ Math.abs(metric.change) }}%</span>
                <span v-else-if="metric.change < 0" style="color: green;">▼ {{ Math.abs(metric.change) }}%</span>
                <span v-else>0%</span>
                </template>
                <!-- Default behavior for other metrics -->
                <template v-else>
                <span v-if="metric.change > 0">▲ {{ Math.abs(metric.change) }}%</span>
                <span v-else-if="metric.change < 0">▼ {{ Math.abs(metric.change) }}%</span>
                <span v-else>0%</span>
                </template>
            </div>
        </div>
      </div>

      <M3Chart
        v-if="metrics.length > 0"
        :metrics="metrics"
        :timeRange="'20160'"
        :period="'1'"
        :showLegend="false"
        :showPie="false"
        :showFullscreen="false"
        :requestor="requestor"
        />
    </div>
  </template>

<script>
import Requestor from '@/helpers/Requestor';
import Loader from '@/components/Loader.vue';
import M3Chart from '../components/dashboard/M3Chart.vue';
import "../assets/css/metrics.css";

export default {
  components: {
    Loader,
    M3Chart
  },
  data() {
    return {
      requestor: new Requestor(),
      isLoading: false,
      metrics: [],
      metricsSummary: [
        {
          id: 1,
          metric_name: "mmm.hubs_ever_installed_count.swd-ps02",
          title: 'Hubs Installed',
          color: "rgba(142, 142, 142, 1)",
          value: 0,
          change: 0,
        },
        {
          id: 2,
          metric_name: "mmm.hubs_reporting_count.swd-ps02",
          title: 'Hubs Reporting',
          color: "rgba(90, 197, 68, 1)",
          value: 0,
          change: 0,
        },
        {
          id: 3,
          metric_name: "mmm.devices_reporting_count.swd-ps02",
          title: 'Devices Reporting',
          color: "rgba(89, 163, 248, 1)",
          value: 0,
          change: 0,
        },
      ],
      failedSensors: [
        {
          id: 1,
          metric_name: "mmm.sensor_fail_humidity_count.swd-ps02",
          value: 0,
        },
        {
          id: 2,
          metric_name: "mmm.sensor_fail_lightning_count.swd-ps02",
          value: 0,
        },
        {
          id: 3,
          metric_name: "mmm.sensor_fail_pressure_count.swd-ps02",
          value: 0,
        },
        {
          id: 4,
          metric_name: "mmm.sensor_fail_rain_count.swd-ps02",
          value: 0,
        },
        {
          id: 5,
          metric_name: "mmm.sensor_fail_sunlight_count.swd-ps02",
          value: 0,
        },
        {
          id: 6,
          metric_name: "mmm.sensor_fail_temp_count.swd-ps02",
          value: 0,
        },
        {
          id: 7,
          metric_name: "mmm.sensor_fail_wind_count.swd-ps02",
          value: 0,
        },
      ],
    };
  },
methods: {
    async fetchMetrics() {
        this.isLoading = true;
        try {
            for (let i = 0; i < this.metricsSummary.length; i++) {
                const metricName = this.metricsSummary[i].metric_name;
                const metricTitle = this.metricsSummary[i].title;
                const color = this.metricsSummary[i].color;

                this.metrics = [
                    ...this.metrics,
                    { name: metricName, title: metricTitle, color: color }
                ];

                const response = await this.requestor.makeMetricsChartDataRequest(metricName, 1, 20160);
                const values = response.data.values;

                if (Array.isArray(values) && values.length > 0) {
                    const lastItem = values[values.length - 1].split(',');
                    const secondLastItem = values.length > 1 ? values[values.length - 2].split(',') : null;

                    const lastValue = parseFloat(lastItem[1]);
                    const secondLastValue = secondLastItem ? parseFloat(secondLastItem[1]) : null;

                    this.metricsSummary[i].value = lastValue;

                    if (secondLastValue !== null) {
                        const percentChange = ((lastValue - secondLastValue) / secondLastValue) * 100;
                        this.metricsSummary[i].change = Number(percentChange.toFixed(3));
                    } else {
                        this.metricsSummary[i].change = 0;
                    }
                } else {
                    console.warn(`No values available for metric: ${metricName}`);
                    this.metricsSummary[i].value = 0;
                    this.metricsSummary[i].change = 0;
                }
            }

            // Fetch failed sensors after fetching other metrics
            await this.fetchFailedSensors();

        } catch (error) {
            console.error('Error fetching metrics:', error);
        } finally {
            this.isLoading = false;
        }
    },

    async fetchFailedSensors() {
        try {
            let totalFailures = 0;
            let totalPreviousFailures = 0; // To calculate the change

            for (const sensor of this.failedSensors) {
                const response = await this.requestor.makeMetricsChartDataRequest(sensor.metric_name, 1, 20160);
                const values = response.data.values;

                if (Array.isArray(values) && values.length > 0) {
                    const lastItem = values[values.length - 1].split(',');
                    const secondLastItem = values.length > 1 ? values[values.length - 2].split(',') : null;

                    const lastValue = parseFloat(lastItem[1]);
                    const secondLastValue = secondLastItem ? parseFloat(secondLastItem[1]) : null;

                    // Update the sensor's value
                    sensor.value = lastValue;

                    // Accumulate the total failures
                    totalFailures += lastValue;

                    // Accumulate the total previous failures for change calculation
                    if (secondLastValue !== null) {
                        totalPreviousFailures += secondLastValue;
                    }
                } else {
                    console.warn(`No values available for failed sensor: ${sensor.metric_name}`);
                }
            }

            let change = 0;
            if (totalPreviousFailures > 0) {
                change = ((totalFailures - totalPreviousFailures) / totalPreviousFailures) * 100;
            }

            this.metricsSummary.push({
                id: this.metricsSummary.length + 1,
                metric_name: "sensor_failures",
                title: "Sensor Failures",
                value: totalFailures,
                change: Number(change.toFixed(3)),
            });

        } catch (error) {
            console.error('Error fetching failed sensors:', error);
        }
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
        position: relative;
    }

    .color-indicator {
        width: 10px; /* Size of the circle */
        height: 10px; /* Size of the circle */
        border-radius: 50%; /* Make it circular */
        position: absolute; /* Position it relative to the card */
        top: 10px; /* Adjust the top position */
        left: 10px; /* Adjust the left position */
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

    .metric-card .change.neutral {
        color: gray;
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
