<template>
    <div id="network-graph">
      <Loader v-if="isLoading" />

      <div class="button-ctn">
        <button @click="toggleExpand" class="button">Fullscreen</button>
      </div>

      <div v-if="chartData" :class="['chart-container', { expanded: isExpanded }]" ref="chartContainer">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </template>

<script>
import Loader from '../Loader.vue';
import { Line } from 'vue-chartjs';
import Requestor from '@/helpers/Requestor';

export default {
  components: {
    Loader,
    Line
  },
  data() {
    return {
        isLoading: false,
        reportType: 'network_status_st',
        requestor: new Requestor(),
        isExpanded: false,
        chartData: null,
        chartOptions: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          elements: {
            point: {
              radius: 0,
              hoverRadius: 5,
              hoverBorderWidth: 3,
            }
          },
          plugins: {
            tooltip: {
              enabled: true,
              mode: 'index',
              intersect: false,
              callbacks: {
                title: (tooltipItems) => {
                  const timestamp = tooltipItems[0].label;
                  return `${timestamp}`;
                },
                label: (context) => {
                  const value = context.raw;
                  const label = context.dataset.label;
                  if (label === 'Online Percentage') {
                    return `${label}: ${value}%`;
                  } else {
                    return `${label}: ${value}`;
                  }
                }
              }
            },
            zoom: {
              pan: { enabled: true, mode: 'x' },
              zoom: {
                wheel: { enabled: true },
                pinch: { enabled: true },
                mode: 'x',
              },
            }
          },
          scales: {
            x: {
              type: 'time',
              time: { unit: 'day' },
              title: { display: true, text: 'Time' }
            },
            'y-left': {
              type: 'linear',
              position: 'left',
              beginAtZero: true,
              title: {
                display: true,
                text: 'Count'
              },
              ticks: {
                callback: (value) => value.toLocaleString(),
              },
              grid: {
                drawOnChartArea: true,
              }
            },
            'y-right': {
              type: 'linear',
              position: 'right',
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Percentage (%)'
              },
              ticks: {
                callback: (value) => `${value}%`,
              },
              grid: {
                drawOnChartArea: false,
              }
            }
          }
        }
    };
  },
  methods: {
    toggleExpand() {
      this.isExpanded = !this.isExpanded;
    },
    async getNetworkStatus() {
        this.isLoading = true;
      try {
        const response = await this.requestor.makePostRequest("report", {
          report_name: this.reportType,
        });

        this.chartData = this.generateChartData(response.data);
    } catch (error) {
        console.error("Error fetching network status:", error);
        this.isLoading = false;
    } finally {
        this.isLoading = false;
      }
    },
    generateChartData(dataSet) {
      const sortedData = dataSet.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const totalCounts = {};
      const onlineCounts = {};
      const offlineCounts = {};

      sortedData.forEach(item => {
          const timestamp = item.timestamp;
          if (!totalCounts[timestamp]) totalCounts[timestamp] = 0;
          if (!onlineCounts[timestamp]) onlineCounts[timestamp] = 0;
          if (!offlineCounts[timestamp]) offlineCounts[timestamp] = 0;

          totalCounts[timestamp] += item.count;
          if (item.status.includes('online')) {
              onlineCounts[timestamp] += item.count;
          } else if (item.status.includes('offline')) {
              offlineCounts[timestamp] += item.count;
          }
      });

      const labels = sortedData.map(item => item.timestamp);
      const onlineData = labels.map(timestamp => onlineCounts[timestamp] || 0);
      const offlineData = labels.map(timestamp => offlineCounts[timestamp] || 0);

      const onlinePercentageData = onlineData.map((onlineCount, index) => {
          const total = totalCounts[labels[index]] || 0;
          const percentage = total > 0 ? (onlineCount / total) * 100 : 0;
          return percentage.toFixed(2);
      });

      return {
          labels: labels,
          datasets: [
              {
                  label: 'Online Count',
                  data: onlineData,
                  fill: false,
                  borderColor: 'rgb(75, 192, 192)',
                  backgroundColor: 'rgb(75, 192, 192)',
                  tension: 0.1,
                  yAxisID: 'y-left',
              },
              {
                  label: 'Offline Count',
                  data: offlineData,
                  fill: false,
                  borderColor: 'rgb(255, 99, 132)',
                  backgroundColor: 'rgb(255, 99, 132)',
                  tension: 0.1,
                  yAxisID: 'y-left',
              },
              {
                  label: 'Online Percentage',
                  data: onlinePercentageData,
                  fill: false,
                  borderColor: 'rgb(54, 162, 235)',
                  backgroundColor: 'rgb(54, 162, 235)',
                  tension: 0.1,
                  yAxisID: 'y-right',
              }
          ]
      };
  },
    updateTitle() {
      this.$emit('update-title', "Online & Offline Tempests");
    }
  },
  mounted() {
    this.getNetworkStatus();
    this.updateTitle();
  }
};
</script>
