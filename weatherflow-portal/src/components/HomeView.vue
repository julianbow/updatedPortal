<template>
    <div id="main">
      <div id="grid">
        <div class="grid-item">
          <h2>Accounts Created</h2>
          <div class="grid-content">
            <table>
              <tr>
                <td>Today:</td>
                <td id="accounts-today" class="value">{{ accountsToday }}</td>
              </tr>
              <tr>
                <td>Last 7 Days:</td>
                <td id="created-7-days" class="value">{{ created7Days }}</td>
              </tr>
              <tr>
                <td>Total:</td>
                <td id="total-accounts" class="value">{{ totalAccounts }}</td>
              </tr>
            </table>
            <p class="grid-content-footnote"><span></span><span>UTC Time</span></p>
          </div>
        </div>
        <div class="grid-item">
          <h2>Active Users</h2>
          <div class="grid-content">
            <table>
              <tr>
                <td>Today:</td>
                <td id="active-accounts-today" class="value">{{ activeToday }}</td>
              </tr>
              <tr>
                <td>Last 3 Days:</td>
                <td id="active-3-days" class="value">{{ active3Days }}</td>
              </tr>
              <tr>
                <td>Last 7 Days:</td>
                <td id="active-7-days" class="value">{{ active7Days }}</td>
              </tr>
            </table>
            <p class="grid-content-footnote">UTC Time</p>
          </div>
        </div>
        <div class="grid-item">
            <h2>Online Tempests by Firmware Version</h2>
            <div class="grid-content">
                <PieChart
                    :chart-data="firmwareChartData"
                    :options="firmwareChartOptions"
                />
            </div>
            <p id="network-online-offline-station-count" class="grid-content-footnote">
                <span>{{ onlineStationCount }} Online Stations</span>
                <span>{{ latestTimestamp }}</span>
            </p>
        </div>
        <div class="grid-item">
          <h2>Online Stations by Firmware Version</h2>
          <div class="grid-content">
              <PieChart
                    :chart-data="firmwareChartData"
                    :options="firmwareChartOptions"
              />
          </div>
          <p id="online-stations-count" class="grid-content-footnote"></p>
        </div>
        <div class="grid-item">
          <h2>Offline Tempests</h2>
            <div class="grid-content">
                <p id="offline-tempest-count">{{ offlineTempestCount }}</p>
            </div>
        </div>
        <div class="grid-item">
            <h2>Offline Stations</h2>
            <div class="grid-content">
                <p id="offline-station-count">{{ offlineStationCount }}</p>
            </div>
        </div>
      </div>
    </div>
</template>

<script>
import Requestor from '../helpers/Requestor';
import PieChart from './PieChart.vue';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export default {
    name: "HomeView",
    components: {
        PieChart  // Register the PieChart component
    },
    data() {
        return {
            firmwareChartData: {
            labels: [],
            datasets: [
                {
                data: [],
                backgroundColor: [],
                hoverBackgroundColor: [],
                },
            ],
            },
            firmwareChartOptions: {
                responsive: true,
                plugins: {
                    legend: {
                    position: 'top',
                    },
                    tooltip: {
                    enabled: true,
                    },
                },
            },
            onlineStationCount: 0,
            latestTimestamp: '',
            offlineLessThanAYear: 0,
            offlineAYearOrMore: 0,
        };
    },
    methods: {
        async fetchAccountsCreated() {
            try {
                const urlData = { report_name: "users_created_by_day" };
                const response = await this.requestor.makePostRequest("report", urlData);
                const data = response.data;

                let today = 0;
                let last7 = 0;
                let total = 0;

                data.forEach((day, index) => {
                    if (index === 0) today = day.count;
                    if (index < 7) last7 += day.count;
                    total += day.count;
                });

                this.accountsToday = today;
                this.created7Days = last7;
                this.totalAccounts = total;
            } catch (error) {
                console.error('Error fetching account data:', error);
            }
        },
        async fetchActiveAccounts() {
            try {
                const urlData = { report_name: "users_last_authenticated_by_day" };
                const response = await this.requestor.makePostRequest("report", urlData);
                const data = response.data;

                let today = 0;
                let last3 = 0;
                let last7 = 0;

                data.forEach((day, index) => {
                    if (index === 0) today = day.count;
                    if (index < 3) last3 += day.count;
                    if (index < 7) last7 += day.count;
                });

                this.activeToday = today;
                this.active3Days = last3;
                this.active7Days = last7;
            } catch (error) {
                console.error('Error fetching active account data:', error);
            }
        },
        async getNetworkStatus() {
            try {
                const urlData = { report_name: "network_status" };
                const response = await this.requestor.makePostRequest("report", urlData);
                const data = response.data;
                if (data) {
                    this.displayNetworkOnlineByFirmwareChart(data);
                }
            } catch (error) {
                console.error('Error fetching network status:', error);
            }
        },
        async getNetworkStatusSt() {
            try {
                const urlData = { report_name: "network_status_st" };
                const response = await this.requestor.makePostRequest("report", urlData);
                const data = response.data;
                if (data) {
                    this.displayNetworkOnlineOfflineChart(data);
                }
            } catch (error) {
                console.error('Error fetching network status:', error);
            }
        },
        displayNetworkOnlineByFirmwareChart(data) {
            const latestTimestampString = this.getLatestTSForNetworkReport(data);
            const labels = [];
            const counts = [];

            let offlineLessThanAYear = 0;
            let offlineAYearOrMore = 0;
            const encounteredStatuses = new Set();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            data.forEach((item) => {
                const itemDate = new Date(item.timestamp);
                itemDate.setHours(0, 0, 0, 0);

                if (item.firmware_revision && item.timestamp === latestTimestampString) {
                const label = `v${item.firmware_revision}`;
                const index = labels.indexOf(label);

                if (index === -1) {
                    labels.push(label);
                    counts.push(item.count);
                } else {
                    counts[index] += item.count;
                }
                }

                if (itemDate.getTime() === today.getTime() && item.status.includes('offline')) {
                if ([
                    'offline_1h',
                    'offline_1d',
                    'offline_1w',
                    'offline_1m',
                    'offline_3m',
                    'offline_6m',
                    'offline_9m',
                    ].includes(item.status) && !encounteredStatuses.has(item.status)) {
                    offlineLessThanAYear += item.count;
                    encounteredStatuses.add(item.status);
                } else if (item.status === 'offline_12m' && !encounteredStatuses.has(item.status)) {
                    offlineAYearOrMore += item.count;
                    encounteredStatuses.add(item.status);
                }
                }
            });

            this.firmwareChartData = {
                labels,
                datasets: [
                {
                    data: counts,
                    backgroundColor: [], // Colors are now handled in PieChart.vue
                    hoverBackgroundColor: [], // Colors are now handled in PieChart.vue
                },
                ],
            };

            this.onlineStationCount = counts.reduce((sum, count) => sum + count, 0);
            this.latestTimestamp = this.getDisplayDate(latestTimestampString);
            this.offlineLessThanAYear = offlineLessThanAYear;
            this.offlineAYearOrMore = offlineAYearOrMore;
        },
        getLatestTSForNetworkReport(data) {
            let latestTimestamp = 0;
            let latestTimestampString = null;

            // Find the latest timestamp reported
            for (let x = 0; x < data.length; x++) {
                let currentTS = dayjs(data[x].timestamp).utc().valueOf();

                if (currentTS > latestTimestamp) {
                    latestTimestamp = currentTS;
                    latestTimestampString = data[x].timestamp;
                }
            }

            return latestTimestampString;
        },
        getDisplayDate(timestamp) {
            return dayjs(timestamp).utc().format("M/D/YY hh:mm A [UTC]");
        }
    },
    mounted() {
        this.requestor = new Requestor();
        this.fetchAccountsCreated();
        this.fetchActiveAccounts();
        this.getNetworkStatus();
    }
};
</script>