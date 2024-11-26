<template>
  <div id="metrics-chart">
    <Loader v-if="isLoading" />

    <div class="button-ctn">
      <button v-if="showPie" @click="toggleChartType" class="button">{{ chartType === 'line' ? 'Pie' : 'Line' }} Chart</button>
      <button v-if="showFullscreen" @click="toggleExpand" class="button">Fullscreen</button>
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
import { Chart as ChartJS, TimeScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { Line, Pie } from 'vue-chartjs';
import zoomPlugin from 'chartjs-plugin-zoom';
import Loader from '@/components/Loader.vue';

ChartJS.register(TimeScale, LinearScale, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, zoomPlugin, Filler);

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
          mode: 'index',
          intersect: false,
        },
        hover: {
          mode: 'index',
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
          legend: {
            display: this.showLegend,
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
        const { name } = metric;
        const cacheKey = `${name}_${this.timeRange}_${this.period}`;

        if (this.dataCache[cacheKey]) {
          datasets.push(this.dataCache[cacheKey]);
        } else {
          try {
            const response = await this.requestor.makeMetricsChartDataRequest(name, this.period, this.timeRange);
            if (response.data.status.status_code === 0) {
              const dataset = this.buildDataset(response.data, metric);
              datasets.push(dataset);
              this.dataCache[cacheKey] = dataset;
            }
          } catch (error) {
            console.error(`Error fetching data for metric ${name}:`, error);
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

      const color = metric.color;
      const title = metric.title;

      const isHubsInstalled = title === 'Hubs Installed';

      return {
        label: title,
        borderColor: color,
        pointBackgroundColor: color,
        pointHoverBackgroundColor: color,
        backgroundColor: isHubsInstalled ? 'transparent' : color.replace(/rgba\((.+?),(.+?),(.+?),.+?\)/, 'rgba($1,$2,$3,0.2)'),
        borderWidth: 3,
        borderDash: isHubsInstalled ? [5, 5] : [],
        pointRadius: 0,
        pointHoverRadius: 7,
        hitRadius: 10,
        tension: 0.4,
        fill: !isHubsInstalled,
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
