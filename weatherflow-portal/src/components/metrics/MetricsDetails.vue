<template>
    <div id="metrics-data">
        <Loader :isLoading="isLoading" />
        <div class="metrics-header">
            <h1>{{ metric }}</h1>
            <div class="timerange-selector">
                Time Range:
                <select id="metrics-select-range">
                    <option value="10080">Last 1 Week</option>
                    <option value="20160" selected="selected">Last 2 Weeks</option>
                    <option value="40320">Last 4 Weeks</option>
                    <option value="120960">Last 26 Weeks</option>
                    <option value="564480">Last 1 Year</option>
                </select>
                Period:
                <select id="metrics-select-period">
                    <option value="1">1 Minute</option>
                    <option value="10">10 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="1440">1 Day</option>
                </select>
            </div>
        </div>
        <div id="metrics-list">
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Metric</th>
                        <th>Source</th>
                        <th>Timestamp</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(metric, index) in metricsData" :key="index">
                        <td><input type="checkbox"></td>
                        <td>{{ metric.name }}</td>
                        <td>{{ metric.source }}</td>
                        <td>{{ metric.timestamp }}</td>
                        <td>{{ metric.value }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>


<script>
import Loader from '../Loader.vue';
import Day from "@/helpers/Day";

export default {
    components: {
        Loader,
    },
    props: {
        metric: String,
        requestor: Object,
    },
    data() {
        return {
            metricsData: null,
            isLoading: false,
        };
    },
    methods: {
        async showMetricsData(metric) {
            this.isLoading = true;
            try {
                const response = await this.requestor.makeMetricsDataRequest(metric);
                if (response.data.status.status_code === 0) {
                    this.metricsData = this.buildMetricsObject(response.data.metrics);
                }
            } catch (error) {
                console.error('Error getting metrics:', error);
            } finally {
                this.isLoading = false;
            }
        },
        buildMetricsObject(metrics) {
            return metrics.map(metric => {
                const nameParts = metric.name.split('.');
                return {
                    name: nameParts[1],
                    source: nameParts[nameParts.length - 1],
                    value: metric.value,
                    timestamp: Day.formatEpochTime(metric.timestamp),
                };
            });
        }
    },
    mounted() {
        this.showMetricsData(this.metric);
    }
}
</script>
