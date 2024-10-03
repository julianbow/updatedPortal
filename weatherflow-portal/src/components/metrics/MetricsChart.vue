<template>
    <div id="metrics-chart">
      <Loader v-if="isLoading" />
      <canvas ref="chartCanvas"></canvas>
    </div>
  </template>

  <script>
    import { Chart as ChartJS, TimeScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
    import zoomPlugin from 'chartjs-plugin-zoom';
    import 'chartjs-adapter-date-fns';
    import Loader from '../Loader.vue';

    ChartJS.register(TimeScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, zoomPlugin);

    export default {
      components: { Loader },
      props: {
        metrics: Array, // Array of selected metrics
        timeRange: String,
        period: String,
        requestor: Object
      },
      data() {
        return {
          chartInstance: null,
          isLoading: false,
          dataCache: {}, // Object to store cached data for metrics
          currentMetrics: [] // Track currently active/selected metrics
        };
      },
      methods: {
        async fetchMetricsData() {
          this.isLoading = true;
          const datasets = [];

          // Remove cached data for unselected metrics
          this.removeUnselectedMetrics();

          for (const metric of this.metrics) {
            // Check if the metric data is already cached
            if (this.dataCache[metric]) {
              datasets.push(this.dataCache[metric]); // Use cached data
            } else {
              try {
                // If not cached, make API request
                const response = await this.requestor.makeMetricsChartDataRequest(metric, this.period, this.timeRange);
                if (response.data.status.status_code === 0) {
                  const dataset = this.buildDataset(response.data, metric);
                  datasets.push(dataset);
                  this.dataCache[metric] = dataset; // Cache the data
                  console.log(`Caching data for metric: ${metric}`);
                }
              } catch (error) {
                console.error(`Error fetching data for metric ${metric}:`, error);
              }
            }
          }

          this.renderChart(datasets);
          this.isLoading = false;
        },

        buildDataset(data, metric) {
          const formattedData = data.values.map(valueString => {
            const bits = valueString.split(",");
            return {
              x: parseFloat(bits[0]) * 1000,
              y: parseFloat(bits[1])
            };
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

        renderChart(datasets) {
          console.log("RENDER CHART");
          const ctx = this.$refs.chartCanvas.getContext('2d');

          if (this.chartInstance) {
            this.chartInstance.destroy(); // Destroy previous chart instance before creating a new one
          }

          this.chartInstance = new ChartJS(ctx, {
            type: 'line',
            data: { datasets },
            options: {
              interaction: {
                mode: 'nearest',
                intersect: false,
              },
              hover: {
                mode: 'nearest',
                intersect: false,
              },
              plugins: {
                tooltip: {
                  enabled: true,
                  mode: 'nearest',
                  intersect: false,
                  callbacks: {
                    label: (context) => `${context.dataset.label}: ${context.parsed.y}`
                  }
                },
                zoom: {
                  pan: {
                    enabled: true,
                    mode: 'x', // Enable panning on the x-axis
                  },
                  zoom: {
                    wheel: {
                      enabled: true, // Enable zooming with the mouse wheel
                    },
                    pinch: {
                      enabled: true, // Enable zooming by pinching on touch devices
                    },
                    mode: 'x', // Zoom only along the x-axis
                  },
                },
              },
              scales: {
                x: {
                  type: 'time',
                  time: { unit: 'day' },
                  title: { display: true, text: 'Time' }
                },
              }
            }
          });
        },

        removeUnselectedMetrics() {
          // Remove data for metrics that are no longer selected
          const selectedMetrics = new Set(this.metrics);

          // Iterate through cached data and remove unselected metrics
          for (const metric in this.dataCache) {
            if (!selectedMetrics.has(metric)) {
              console.log(`Removing cached data for unselected metric: ${metric}`);
              delete this.dataCache[metric]; // Remove the cached data
            }
          }

          // Update currentMetrics to reflect the currently selected metrics
          this.currentMetrics = [...this.metrics];
        },

        getRandomColor() {
          const r = Math.floor(Math.random() * 255);
          const g = Math.floor(Math.random() * 255);
          const b = Math.floor(Math.random() * 255);
          return `rgba(${r}, ${g}, ${b}, 0.8)`;
        }
      },
      watch: {
        metrics: {
          immediate: true,
          handler() {
            this.fetchMetricsData();
          }
        }
      }
    };
  </script>
