<template>
    <div id="network-graph">
      <Loader v-if="isLoading" />

      <div class="button-ctn">
        <button @click="toggleExpand" class="button">Fullscreen</button>
      </div>

      <div v-if="chartData1" :class="['chart-container', { expanded: isExpanded }]" ref="chartContainer">
        <Line :data="chartData1" :options="chartOptions" />
      </div>
    </div>
  </template>


<script>
import { Line } from 'vue-chartjs';
import Requestor from '@/helpers/Requestor';
import Loader from '../Loader.vue';

export default {
  components: {
    Line,
    Loader
  },
  data() {
    return {
        isLoading: false,
        reportType: 'network_status_st',
        requestor: new Requestor(),
        isExpanded: false,
        chartData1: null,
        chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            yAxes: [
            {
                id: 'y-left',
                position: 'left',
                ticks: {
                beginAtZero: true,
                callback: function(value) { return value + '%'; }
                },
                scaleLabel: {
                display: true,
                labelString: 'Online Percentage'
                }
            },
            {
                id: 'y-right',
                position: 'right',
                ticks: {
                beginAtZero: true,
                callback: function(value) { return value + '%'; }
                },
                scaleLabel: {
                display: true,
                labelString: 'Offline Percentage'
                }
            }
            ],
            x: {
            type: 'time',
            time: {
                unit: false, // Let Chart.js decide the appropriate unit
                tooltipFormat: 'yyyy-MM-DD HH:mm', // Adjust tooltip to display date and time properly
                displayFormats: {
                millisecond: 'HH:mm:ss.SSS',
                second: 'HH:mm:ss',
                minute: 'HH:mm',
                hour: 'HH:mm',
                day: 'MMM D',
                week: 'MMM D',
                month: 'MMM yyyy',
                year: 'yyyy',
                }
            },
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
        this.processOnlineOfflineData(response.data);
    } catch (error) {
        console.error("Error fetching network status:", error);
        this.isLoading = false;
    } finally {
        this.isLoading = false;
      }
    },
    processOnlineOfflineData(data) {
      this.chartData1 = this.generateChartData(data);
      this.chartData2 = this.generateChartData(data);
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

        return {
            labels: labels,
            datasets: [
            {
                label: 'Online Count',
                data: onlineData,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 5,
            },
            {
                label: 'Offline Count',
                data: offlineData,
                fill: false,
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 5,
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
