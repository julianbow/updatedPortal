<template>
    <div id="metrics-chart">
        <Loader v-if="isLoading" />
        <MetricsChart
            :metricsData="metricsData"
            :requestor="requestor"
        />
    </div>
</template>

<script>
import Loader from '../Loader.vue';
export default {
    components: {
        Loader,
    },
    props: {
        metricsData: Array,
        requestor: Object,
    },
    data() {
        return {
            isLoading: false,
        };
    },
};
</script>