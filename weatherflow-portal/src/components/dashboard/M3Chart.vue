<template>
  <div id="metrics-chart">
    <Loader v-if="isLoading" />

    <!-- <div class="button-ctn">
      <button v-if="showPie" @click="toggleChartType" class="button">
        {{ chartType === 'line' ? 'Pie' : 'Line' }} Chart
      </button>
      <button v-if="showFullscreen" @click="toggleExpand" class="button">Fullscreen</button>
    </div> -->

    <!-- First chart container (line or pie) -->
    <div v-if="datasets && datasets.length" :class="['chart-container', { expanded: isExpanded }]" ref="chartContainer">
      <Line v-if="chartType === 'line'" :data="chartData" :options="chartOptions" />
      <Pie v-if="chartType === 'pie'" :data="chartData" :options="chartOptions" />
    </div>
    <div v-else>
      <p>No data available for the selected metrics</p>
    </div>

    <!-- Second chart container (bar) for the last metric -->
    <div v-if="barDataset" class="chart-container bar" style="margin-top: 2rem;">
      <Bar :data="barChartData" :options="barChartOptions" />
    </div>
  </div>
</template>

<script>
import { Chart as ChartJS, TimeScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler, BarElement, CategoryScale } from 'chart.js';
import { Line, Pie, Bar } from 'vue-chartjs';
import zoomPlugin from 'chartjs-plugin-zoom';
import Loader from '@/components/Loader.vue';

ChartJS.register(TimeScale, LinearScale, CategoryScale, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, zoomPlugin, Filler, BarElement);

export default {
  components: {
    Loader,
    Line,
    Pie,
    Bar
  },
  props: {
    metrics: Array,
    timeRange: String,
    period: String,
    showLegend: Boolean,
    showPie: Boolean,
    showFullscreen: Boolean,
    requestor: Object
  },
  data() {
    return {
      isLoading: false,
      dataCache: {},
      datasets: null,
      barDataset: null,
      currentMetrics: [],
      isExpanded: false,
      chartType: 'line',
    };
  },
  computed: {
    chartData() {
      // For line or pie chart data
      if (this.datasets && this.chartType === 'line') {
        return { datasets: this.datasets };
      } else if (this.datasets && this.chartType === 'pie') {
        const labels = this.datasets.map(dataset => dataset.label);
        const data = this.datasets.map(dataset =>
          dataset.data.reduce((acc, point) => acc + point.y, 0)
        );
        const backgroundColor = this.datasets.map(dataset => dataset.borderColor);

        return {
          labels,
          datasets: [{ data, backgroundColor }]
        };
      }
    },
    chartOptions() {
      // Options for line/pie chart
      return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          tooltip: {
            enabled: true,
          },
          legend: {
            display: this.showLegend,
          },
          zoom: {
            pan: {
              enabled: true,
              mode: 'xy',
            },
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: 'xy',
            },
          },
        },
        scales: {
          x: {
            type: 'time',
            time: { unit: 'day' },
            title: { display: true, text: 'Time' },
          },
          y: {
            beginAtZero: false,
            ticks: {
              callback: (value) => value.toLocaleString(),
            },
          },
        },
      };
    },
    barChartData() {
      // Data for the bar chart (only the last metric)
      return this.barDataset
        ? { datasets: [this.barDataset] }
        : { datasets: [] };
    },
    barChartOptions() {
      // Options for the bar chart
      return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          tooltip: {
            enabled: true,
          },
          legend: {
            display: this.showLegend,
          },
        },
        scales: {
          x: {
            type: 'time',
            time: { unit: 'day' },
            title: { display: true, text: 'Time' },
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => value.toLocaleString(),
            },
          },
        },
      };
    }
  },
  methods: {
    async fetchMetricsData() {
      this.isLoading = true;
      const lineDatasets = [];
      let barDataset = null;

      this.removeUnselectedMetrics();

      for (let i = 0; i < this.metrics.length; i++) {
        const metric = this.metrics[i];
        const cacheKey = `${metric.name}_${this.timeRange}_${this.period}`;

        if (this.dataCache[cacheKey]) {
          if (i === this.metrics.length - 1) {
            // last metric is bar chart
            barDataset = this.dataCache[cacheKey];
          } else {
            lineDatasets.push(this.dataCache[cacheKey]);
          }
        } else {
          try {
            const response = await this.requestor.makeMetricsChartDataRequest(metric.name, this.period, this.timeRange);
            if (response.data.status.status_code === 0) {
              const isLastMetric = i === this.metrics.length - 1;
              const dataset = this.buildDataset(response.data, metric, isLastMetric);
              this.dataCache[cacheKey] = dataset;
              if (isLastMetric) {
                barDataset = dataset;
              } else {
                lineDatasets.push(dataset);
              }
            }
          } catch (error) {
            console.error(`Error fetching data for metric ${metric.name}:`, error);
          }
        }
      }

      this.datasets = lineDatasets;
      this.barDataset = barDataset;
      this.isLoading = false;
    },

    buildDataset(data, metric, isLastMetric) {
      const formattedData = data.values.map(valueString => {
        const bits = valueString.split(",");
        return { x: parseFloat(bits[0]) * 1000, y: parseFloat(bits[1]) };
      });

      const color = metric.color;
      const title = metric.title;
      const isHubsInstalled = (title === 'Hubs Installed');

      if (isLastMetric) {
        // Create a bar dataset for the last metric
        return {
          label: metric.title,
          backgroundColor: color.replace('1)', '0.5)'),
          borderColor: color,
          borderWidth: 1,
          data: formattedData,
          type: 'bar'
        };
      }

      // Create line datasets for all other metrics
      return {
        label: metric.title,
        borderColor: color,
        pointBackgroundColor: color,
        pointHoverBackgroundColor: color,
        borderWidth: 3,
        borderDash: isHubsInstalled ? [5, 5] : [],
        pointRadius: 0,
        pointHoverRadius: 7,
        hitRadius: 10,
        tension: 0.4,
        fill: true,
        backgroundColor: isHubsInstalled ? 'transparent' : (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return;

          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, color.replace('1)', '0.9)'));
          gradient.addColorStop(1, color.replace('1)', '0)'));
          return gradient;
        },
        data: formattedData,
      };
    },

    removeUnselectedMetrics() {
      const selectedMetrics = new Set(this.metrics.map(m => m.name));
      for (const key in this.dataCache) {
        const [metricName] = key.split('_');
        if (!selectedMetrics.has(metricName)) {
          delete this.dataCache[key];
        }
      }

      this.currentMetrics = [...this.metrics];
    },

    async toggleExpand() {
      const chartContainer = this.$refs.chartContainer;
      if (chartContainer.requestFullscreen) {
        await chartContainer.requestFullscreen();
      }
    },

    toggleChartType() {
      this.chartType = this.chartType === 'line' ? 'pie' : 'line';
    }
  },
  watch: {
    metrics: {
      immediate: true,
      handler() {
        this.fetchMetricsData();
      }
    },
    timeRange: {
      handler() {
        this.fetchMetricsData();
      }
    },
    period: {
      handler() {
        this.fetchMetricsData();
      }
    }
  }
};
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  margin-bottom: 2rem;
}

.chart-container.bar {
  height: 200px;
}

.button-ctn {
  margin-bottom: 1rem;
}

.button {
  margin-right: 1rem;
  cursor: pointer;
}
</style>
