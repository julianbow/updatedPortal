<template>
        <div id="api-monitoring">
        <h1>API Uptime</h1>
        <ul>
            <li>
                <a href="https://tempest-public-api-uptime.checkly-dashboards.com/">
                    <div class="title">Tempest Public API Uptime</div>
                    <div class="description">TempestOne + Tempest Home</div>
                </a>
            </li>
            <li>
                <a href="https://tempest-one-uptime.checkly-dashboards.com/">
                    <div class="title">TempestOne Uptime</div>
                </a>
            </li>
            <li>
                <a href="https://tempest-home-uptime.checkly-dashboards.com/">
                    <div class="title">Tempest Home Uptime</div>
                </a>
            </li>
        </ul>
        <h1>API Health</h1>
        <ul>
            <li>
                <a href="https://tempest-public-api-health.checkly-dashboards.com/">
                    <div class="title">Tempest Public API Health</div>
                    <div class="description">TempestOne + Tempest Home</div>
                </a>
            </li>
            <li>
                <a href="https://tempest-one-health.checkly-dashboards.com/">
                    <div class="title">TempestOne Health</div>
                </a>
            </li>
            <li>
                <a href="https://tempest-home-health.checkly-dashboards.com/">
                    <div class="title">Tempest Home Health</div>
                </a>
            </li>
        </ul>
    </div>
</template>

<script>
import Requestor from '@/helpers/Requestor';
import "../assets/css/monitoring.css";

export default {
    data() {
        return {
            requestor: new Requestor(),
            metrics: null,
        };
    },
    methods: {
        updateTitle() {
            this.$emit('update-title', 'API Monitoring');
        }
    },
    mounted() {
      this.updateTitle();
    },
}
</script>