<template>
  <div id="metrics-chart">
    <Loader v-if="isLoading" />

    <div class="button-ctn">
      <button @click="toggleChartType" class="button">{{ chartType === 'line' ? 'Pie' : 'Line' }} Chart</button>
      <button @click="toggleExpand" class="button">Fullscreen</button>
    </div>
    <div v-if="datasets && datasets.length" :class="['chart-container', { expanded: isExpanded }]" ref="chartContainer">
      <Line v-if="chartType === 'line'" :data="chartData" :options="chartOptions" />
      <Pie v-if="chartType === 'pie'" :data="chartData" :options="chartOptions" />
    </div>
    <div v-else>
      <p>No data available for the selected metrics</p>
    </div>
  </div>
</template>

<script>
import { Chart as ChartJS, TimeScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Pie } from 'vue-chartjs';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import Loader from '@/components/Loader.vue';

ChartJS.register(TimeScale, LinearScale, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, zoomPlugin);

export default {
  components: {
    Loader,
    Line,
    Pie
  },
  props: {
    metrics: Array,
    timeRange: String,
    period: String,
    requestor: Object
  },
  data() {
    return {
      isLoading: false,
      dataCache: {},
      datasets: null,
      currentMetrics: [],
      isExpanded: false,
      chartType: 'line'
    };
  },
  computed: {
    chartData() {
      if (this.datasets && this.chartType === 'line') {
        return { datasets: this.datasets };
      } else if (this.datasets && this.chartType === 'pie') {
        const labels = this.datasets.map(dataset => dataset.label);
        const data = this.datasets.map(dataset => dataset.data.reduce((acc, point) => acc + point.y, 0));
        const backgroundColor = this.datasets.map(dataset => dataset.borderColor);

        return {
          labels,
          datasets: [{ data, backgroundColor }]
        };
      }
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: this.chartType === 'line' ? 'nearest' : 'point',
          intersect: false,
        },
        hover: {
          mode: this.chartType === 'line' ? 'nearest' : 'point',
          intersect: false,
        },
        plugins: {
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => this.chartType === 'line'
                ? `${context.dataset.label}: ${context.parsed.y}`
                : `${context.label}: ${context.raw}`
            }
          },
          zoom: this.chartType === 'line' ? {
            pan: { enabled: true, mode: 'x' },
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: 'x',
            },
          } : undefined
        },
        scales: this.chartType === 'line' ? {
          x: {
            type: 'time',
            time: { unit: 'day' },
            title: { display: true, text: 'Time' }
          }
        } : undefined
      };
    },
  },
  methods: {
    async fetchMetricsData() {
      this.isLoading = true;
      const datasets = [];

      this.removeUnselectedMetrics();

      for (const metric of this.metrics) {
        const cacheKey = `${metric}_${this.timeRange}_${this.period}`;
        if (this.dataCache[cacheKey]) {
          datasets.push(this.dataCache[cacheKey]);
        } else {
          try {
            const response = await this.requestor.makeMetricsChartDataRequest(metric, this.period, this.timeRange);
            if (response.data.status.status_code === 0) {
              const dataset = this.buildDataset(response.data, metric);
              datasets.push(dataset);
              this.dataCache[cacheKey] = dataset;
            }
          } catch (error) {
            console.error(`Error fetching data for metric ${metric}:`, error);
          }
        }
      }

      this.datasets = datasets;
      this.isLoading = false;
    },

    buildDataset(data, metric) {
      const formattedData = data.values.map(valueString => {
        const bits = valueString.split(",");
        return { x: parseFloat(bits[0]) * 1000, y: parseFloat(bits[1]) };
      });

      const color = this.getRandomColor();

      return {
        label: metric,
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 7,
        hitRadius: 10,
        tension: 0.4,
        fill: false,
        data: formattedData
      };
    },

    removeUnselectedMetrics() {
      const selectedMetrics = new Set(this.metrics);

      for (const key in this.dataCache) {
        const [metric] = key.split('_');
        if (!selectedMetrics.has(metric)) {
          delete this.dataCache[key];
        }
      }

      this.currentMetrics = [...this.metrics];
    },

    getRandomColor() {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      return `rgba(${r}, ${g}, ${b}, 0.8)`;
    },

    async toggleExpand() {
      const chartContainer = this.$refs.chartContainer;
      // Enter fullscreen
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
      immediate: true,
      handler() {
        this.fetchMetricsData();
      }
    },
    period: {
      immediate: true,
      handler() {
        this.fetchMetricsData();
      }
    }
  }
};
</script>
