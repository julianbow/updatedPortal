<template>
    <div id="metrics-data">
        <Loader :isLoading="isLoading"/>
        <div id="metrics-list">
            <h1>{{ this.metric }}</h1>
            <table>
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Source</th>
                        <th>Timestamp</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody v-for="(metric, index) in metricsData" :key="index">
                    <tr>
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
                    console.log('Metrics data:', this.metricsData);
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
