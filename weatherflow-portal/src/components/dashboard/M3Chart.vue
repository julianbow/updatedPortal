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
import { Chart as ChartJS, TimeScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler, BarElement } from 'chart.js';
import { Line, Pie } from 'vue-chartjs';
import zoomPlugin from 'chartjs-plugin-zoom';
import Loader from '@/components/Loader.vue';

ChartJS.register(TimeScale, LinearScale, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, zoomPlugin, Filler, BarElement);

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
      datasetsUnder6k: [],
      datasetsOver60k: [],
      currentMetrics: [],
      isExpanded: false,
      chartType: 'line',
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
        plugins: {
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) =>
                this.chartType === 'line'
                  ? `${context.dataset.label}: ${context.parsed.y}`
                  : `${context.label}: ${context.raw}`,
            },
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
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true,
              },
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
            min: 0,
            title: { display: true, text: 'Value' },
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
      const datasets = [];

      this.removeUnselectedMetrics();

      for (let i = 0; i < this.metrics.length; i++) {
        const metric = this.metrics[i];
        const cacheKey = `${metric.name}_${this.timeRange}_${this.period}`;

        if (this.dataCache[cacheKey]) {
          datasets.push(this.dataCache[cacheKey]);
        } else {
          try {
            const response = await this.requestor.makeMetricsChartDataRequest(metric.name, this.period, this.timeRange);
            if (response.data.status.status_code === 0) {
              console.log(i)
              const isLastMetric = i === 3;
              const dataset = this.buildDataset(response.data, metric, isLastMetric);
              datasets.push(dataset);
              this.dataCache[cacheKey] = dataset;
            }
          } catch (error) {
            console.error(`Error fetching data for metric ${metric.name}:`, error);
          }
        }
      }

      this.datasets = datasets;
      this.isLoading = false;
    },

    buildDataset(data, metric, isLastMetric) {
  const formattedData = data.values.map(valueString => {
    const bits = valueString.split(",");
    return { x: parseFloat(bits[0]) * 1000, y: parseFloat(bits[1]) };
  });

  const color = metric.color;
  const title = metric.title;

  const isHubsInstalled = title === 'Hubs Installed';

  if (isLastMetric) {
    // Build a bar chart dataset for the last metric
    return {
      label: metric.title,
      backgroundColor: color.replace('1)', '0.8)'), // Slight transparency for bars
      borderColor: color,
      borderWidth: 1,
      data: formattedData,
      type: 'bar', // Specify that this dataset is a bar chart
    };
  }

  // Build a line chart dataset for other metrics
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
      if (!chartArea) {
        return;
      }

      const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      gradient.addColorStop(0, color.replace('1)', '0.8)'));
      gradient.addColorStop(1, color.replace('1)', '0)'));
      return gradient;
    },
    data: formattedData,
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
