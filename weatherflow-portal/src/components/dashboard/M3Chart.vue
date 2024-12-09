<template>
  <div id="metrics-chart">
    <Loader v-if="isLoading" />

    <div v-if="datasets && datasets.length" class="chart-container" ref="chartContainer"></div>
    <div v-else>
      <p>No data available for the selected metrics</p>
    </div>
  </div>
</template>

<script>
import Highcharts from 'highcharts';
import Loader from '@/components/Loader.vue';

export default {
  components: {
    Loader
  },
  props: {
    metrics: Array,
    timeRange: String,
    period: String,
    showLegend: Boolean,
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
      chartType: 'line',
      chart: null
    };
  },
  computed: {
    highchartsOptions() {
      if (!this.datasets || !this.datasets.length) return {};

      const lastIndex = this.datasets.length - 1;
      const series = this.datasets.map((ds, index) => {
        const isFirst = index === 0;
        const isLast = index === lastIndex;
        const isSecondOrThird = index === 1 || index === 2;

        let seriesType = 'spline';
        const additionalProps = {};

        if (isFirst) {
          additionalProps.dashStyle = 'Dot';
          additionalProps.lineWidth = 4;
        }

        if (isLast) {
          seriesType = 'column';
          ds.borderColor = 'rgba(255, 0, 0, 0.6)';
        } else {
          additionalProps.marker = {
            enabled: false,
            states: {
              hover: {
                enabled: true
              }
            }
          };
        }

        if (!isFirst && !isLast && isSecondOrThird) {
          seriesType = 'areaspline';
          additionalProps.fillColor = {
            linearGradient: [0, 0, 0, 300],
            stops: [
              [0, ds.borderColor.replace('1)', '0.9)')],
              [0.7, ds.borderColor.replace('1)', '0.1')],
              [1, ds.borderColor.replace('1)', '0')],
            ]
          };
        }

        return {
          id: ds.id,
          name: ds.label,
          type: seriesType,
          data: ds.data.map(point => [point.x, point.y]),
          color: ds.borderColor,
          yAxis: isLast ? 1 : 0,
          ...additionalProps
        };
      });

      return {
        chart: {
          type: 'line',
          zoomType: 'xy',
          backgroundColor: 'transparent',
          events: {
            render: function() {
              const chart = this;
              const lineY = chart.plotTop + chart.plotHeight * 0.65;

              if (!chart.topLine) {
                chart.topLine = chart.renderer.path(['M', chart.plotLeft, lineY, 'L', chart.plotLeft + chart.plotWidth, lineY])
                  .attr({
                    stroke: '#D3D3D3',
                    'stroke-width': 2
                  })
                  .add();
              } else {
                chart.topLine.attr({
                  d: ['M', chart.plotLeft, lineY, 'L', chart.plotLeft + chart.plotWidth, lineY]
                });
              }
            }
          }
        },
        title: { text: '' },
        credits: { enabled: false },
        xAxis: {
          type: 'datetime',
          crosshair: true,
          labels: {
            style: {
              color: '#555',
              fontSize: '12px'
            }
          }
        },
        yAxis: [
          {
            top: '0%',
            height: '65%',
            lineWidth: 1,
            title: { text: null },
            labels: {
              formatter: function() {
                return this.value.toLocaleString();
              }
            },
            min: 60000,
            showFirstLabel: false
          },
          {
            top: '65%',
            height: '35%',
            offset: 0,
            maxPadding: 0.3,
            lineWidth: 1,
            title: { text: null },
            labels: {
              formatter: function() {
                return this.value.toLocaleString();
              }
            },
            plotBands: [{
              from: 0,
              to: 30,
              color: '#f6f7f8'
            }]
          }
        ],
        tooltip: {
          shared: true,
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderRadius: 4,
          borderWidth: 0,
          style: {
            color: '#fff'
          },
          formatter: function() {
            let s = `<b>${Highcharts.dateFormat('%A, %b %e, %Y', this.x)}</b><br/>`;
            this.points.forEach(point => {
              s += `<span style="color:${point.color}">\u25CF</span> ${point.series.name}: ${point.y.toLocaleString()}<br/>`;
            });
            return s;
          }
        },
        legend: {
          enabled: this.showLegend,
          itemStyle: {
            color: '#555',
            fontSize: '12px'
          }
        },
        plotOptions: {
          series: {
            states: {
              inactive: {
                enabled: false
              }
            }
          }
        },
        series
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
        const isLastMetric = i === this.metrics.length - 1;
        const cacheKey = `${metric.name}_${this.timeRange}_${this.period}`;

        if (this.dataCache[cacheKey]) {
          datasets.push(this.dataCache[cacheKey]);
        } else {
          try {
            const response = await this.requestor.makeMetricsChartDataRequest(metric.name, this.period, this.timeRange);
            if (response.data.status.status_code === 0) {
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
      this.updateChart();
    },

    buildDataset(data, metric, isLastMetric) {
      const formattedData = data.values.map(valueString => {
        const bits = valueString.split(",");
        return { x: parseFloat(bits[0]) * 1000, y: parseFloat(bits[1]) };
      });

      const color = metric.color;

      console.log(metric.name)
      return {
        id: metric.name,
        label: metric.title,
        borderColor: color,
        data: formattedData
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

    updateChart() {
      if (!this.$refs.chartContainer) return;

      if (!this.chart) {
        this.chart = Highcharts.chart(this.$refs.chartContainer, this.highchartsOptions);
      } else {
        this.chart.update(this.highchartsOptions, true, true);
      }
    },

    async toggleExpand() {
      const chartContainer = this.$refs.chartContainer;
      if (chartContainer.requestFullscreen) {
        await chartContainer.requestFullscreen();
      }
    },

    toggleSeries(id) {
      const series = this.chart.get(id);
      if (series) {
        // Toggle visibility
        const currentlyVisible = series.visible;
        series.setVisible(!currentlyVisible, false);
        // Redraw after toggling
        this.chart.redraw();
      } else {
        console.warn(`Series with id "${id}" not found.`);
      }
    }
  },
  watch: {
    metrics: {
      immediate: true,
      handler() {
        this.fetchMetricsData();
      }
    },
    timeRange() {
      this.fetchMetricsData();
    },
    period() {
      this.fetchMetricsData();
    },
    datasets() {
      if (this.datasets) {
        this.updateChart();
      }
    }
  }
};
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
  margin-bottom: 2rem;
  background: transparent;
}

.button-ctn {
  margin-bottom: 1rem;
}
.button {
  margin-right: 1rem;
  cursor: pointer;
}
</style>
