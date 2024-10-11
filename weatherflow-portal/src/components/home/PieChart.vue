<template>
    <Pie
      id="online-offline-chart"
      :data="processedChartData"
      :options="chartOptions"
    />
  </template>

<script>
import { Pie } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  ArcElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(Title, Tooltip, ArcElement, CategoryScale, LinearScale);

export default {
  name: 'PieChart',
  components: { Pie },
  props: {
    chartData: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      pieColors: [
        "#1a0d1c",
        "#341b39",
        "#4e2955",
        "#683772",
        "#82458f",
        "#9c53ab",
        "#ac6fb9",
        "#bd8cc7",
        "#cda9d5",
        "#dec5e3",
        "#eee2f1",
      ],
      chartOptions: {
      plugins: {
          legend: {
            display: false
          }
        }
    }
    };
  },
  computed: {
    processedChartData() {
      return {
        ...this.chartData,
        datasets: this.chartData.datasets.map((dataset) => ({
          ...dataset,
          backgroundColor: this.pieColors.slice(0, dataset.data.length),
          hoverBackgroundColor: this.pieColors.slice(0, dataset.data.length),
        })),
      };
    },
  },
};
</script>
