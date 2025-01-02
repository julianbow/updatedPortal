<template>
  <div id="m3-dashboard" class="grid-list">
    <Loader :isLoading="isLoading" />

    <div class="header">
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

    <div class="metrics-summary">
      <div
          class="metric-card"
          v-for="metric in metricsSummary"
          :key="metric.id"
          :class="{ clicked: metric.clicked }"
          @click="toggleMetricSeries(metric)"
      >
        <div class="dotted-border" v-if="metric.id === metricsSummary[0].id">
          <div class="color-indicator" :style="{ backgroundColor: metric.color }"></div>
        </div>
        <div v-else class="color-indicator" :style="{ backgroundColor: metric.color }"></div>
        <span class="title">{{ metric.title }}</span>
        <div class="value">{{ formatNumber(metric.value) }}</div>
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
      ref="m3Chart"
      v-if="metrics.length > 0"
      :metrics="metrics"
      :timeRange="selectedTimeRange"
      :period="selectedPeriod"
      :showLegend="false"
      :showPie="false"
      :showFullscreen="false"
      :requestor="requestor"
    />

    <M3Failures
      :requestor="requestor"
      :selectedTimeRange="selectedTimeRange"
      :selectedPeriod="selectedPeriod"
      :totalFailures="totalFailures"
    />

  </div>
</template>

<script>
import Requestor from '@/helpers/Requestor';
import Loader from '@/components/Loader.vue';
import M3Chart from '../components/dashboard/M3Chart.vue';
import M3Failures from '@/components/dashboard/M3Failures.vue';

export default {
components: {
  Loader,
  M3Chart,
  M3Failures
},
data() {
  return {
    requestor: new Requestor(),
    isLoading: false,
    selectedTimeRange: "20160",
    selectedPeriod: "10",
    metrics: [],
    totalFailures: 0,
    metricsSummary: [
      {
        id: 1,
        metric_name: "mmm.hubs_ever_installed_count.swd-ps02",
        title: 'Hubs Installed',
        color: "rgba(142, 142, 142, 1)",
        value: 0,
        change: 0,
        clicked: false
      },
      {
        id: 2,
        metric_name: "mmm.hubs_reporting_count.swd-ps02",
        title: 'Hubs Reporting',
        color: "rgba(90, 197, 68, 1)",
        value: 0,
        change: 0,
        clicked: false
      },
      {
        id: 3,
        metric_name: "mmm.devices_reporting_count.swd-ps02",
        title: 'Devices Reporting',
        color: "rgba(89, 163, 248, 1)",
        value: 0,
        change: 0,
        clicked: false
      },
      {
        id: 4,
        metric_name: "mmm.sensor_fail_total_count.swd-ps02",
        title: 'Sensor Failures',
        color: "rgba(255, 0, 0, 1)",
        value: 0,
        change: 0,
        clicked: false
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

        if (metricName === "mmm.sensor_fail_total_count.swd-ps02") {
          this.totalFailures = Number(values[values.length - 1].split(',')[1]);
        }

        if (Array.isArray(values) && values.length > 0) {
          const lastItem = values[values.length - 1].split(',');
          const lastValue = parseFloat(lastItem[1]);

          // Find the first non-zero item in the array
          let initialIndex = 0;
          let foundNonZero = false;
          for (let j = 0; j < values.length - 1; j++) {
            const val = parseFloat(values[j].split(',')[1]);
            if (val !== 0) {
              initialIndex = j;
              foundNonZero = true;
              break;
            }
          }

          const firstItem = foundNonZero ? values[initialIndex].split(',') : null;
          const secondLastValue = firstItem ? parseFloat(firstItem[1]) : null;

          this.metricsSummary[i].value = lastValue;

          if (secondLastValue !== null) {
            if (secondLastValue !== 0) {
              const percentChange = ((lastValue - secondLastValue) / secondLastValue) * 100;
              this.metricsSummary[i].change = Number(percentChange.toFixed(3));
            } else {
              this.metricsSummary[i].change = 0;
            }
          } else {
            this.metricsSummary[i].change = 0;
          }
        } else {
          console.warn(`No values available for metric: ${metricName}`);
          this.metricsSummary[i].value = 0;
          this.metricsSummary[i].change = 0;
        }
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      this.isLoading = false;
    }
  },
  formatNumber(value) {
    if (typeof value === "number") {
      return new Intl.NumberFormat().format(value);
    }
    return value;
  },
  toggleMetricSeries(metric) {
    if (this.$refs.m3Chart && this.$refs.m3Chart.toggleSeries) {
      this.$refs.m3Chart.toggleSeries(metric.metric_name);
    }
    metric.clicked = !metric.clicked; // Toggle the clicked state
  }
},
mounted() {
  this.$emit('update-title', 'M³ Dashboard');
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

.header {
  display: flex;
  flex-direction: row;
  justify-content: end;
  margin-right: 20px;
}

.metrics-summary {
  display: flex;
  justify-content: space-between;
  margin: 20px;
}

.metric-card {
  background: white;
  padding: 20px 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 20%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.metric-card.clicked {
  background: #d3d3d3;
  transform: scale(0.95);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  color: #555;
}

.dotted-border {
  border: 2.5px dotted #8e8e8e;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 10px;
  left: 10px;
  box-sizing: border-box;
}

.color-indicator {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: inherit;
}

.dotted-border .color-indicator {
position: static;
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
  color: #ff0000;
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
