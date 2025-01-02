<template>
    <div class="mini-graph">
      <div ref="chartContainer"></div>
    </div>
  </template>

  <script>
  import Highcharts from "highcharts";

  export default {
    props: {
      data: {
        type: Array,
        required: true, // Array of data points for the graph
      },
      maxY: {
        type: Number,
        required: true, // Maximum value for the Y-axis
      },
    },
    mounted() {
      this.renderChart();
    },
    methods: {
      renderChart() {
        Highcharts.chart(this.$refs.chartContainer, {
          chart: {
            type: "area", // Use area chart for shading underneath
            backgroundColor: "transparent",
            height: 50, // Adjust to fit inside the card
            margin: [0, 0, 0, 0],
          },
          title: {
            text: null, // No title
          },
          xAxis: {
            visible: false, // Hide X-axis
          },
          yAxis: {
            visible: false, // Hide Y-axis
            min: 0,
            max: this.maxY,
            endOnTick: false
          },
          tooltip: {
            enabled: false, // Disable tooltips
          },
          legend: {
            enabled: false, // Hide the legend
          },
          credits: {
            enabled: false, // Disable Highcharts.com credits
          },
          plotOptions: {
            area: {
              marker: {
                enabled: false, // Disable markers
              },
              states: {
                hover: {
                  enabled: false, // Disable hover effect
                },
              },
              enableMouseTracking: false, // Disable mouse tracking
                fillColor: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                  [0, "rgba(255, 0, 0, 0.5)"], // Light red at the top
                  [1, "rgba(255, 0, 0, 0)"],   // Transparent at the bottom
                ],
                },
              lineColor: "rgba(255, 0, 0, 1)", // red line color
              lineWidth: 1,
            },
          },
          series: [
            {
              data: this.data,
              color: "rgba(255, 0, 0, 1)", // red line color
            },
          ],
        });
      },
    },
  };
  </script>

  <style scoped>
  .mini-graph {
    width: 100%;
    height: 50px; /* Match chart height */
  }
  </style>
