<template>
    <div id="main">
      <div id="grid">
        <div class="grid-item">
            <h2>Accounts Created</h2>
            <div class="grid-content">
                <table>
                    <tr>
                        <td>Today:</td>
                        <td class="value">{{ accountsToday }}</td>
                    </tr>
                    <tr>
                        <td>Last 7 Days:</td>
                        <td class="value">{{ created7Days }}</td>
                    </tr>
                    <tr>
                        <td>Total:</td>
                        <td class="value">{{ totalAccounts }}</td>
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
                        <td class="value">{{ activeToday }}</td>
                    </tr>
                    <tr>
                        <td>Last 3 Days:</td>
                        <td class="value">{{ active3Days }}</td>
                    </tr>
                    <tr>
                        <td>Last 7 Days:</td>
                        <td class="value">{{ active7Days }}</td>
                    </tr>
                </table>
                <p class="grid-content-footnote">UTC Time</p>
            </div>
        </div>
        <div class="grid-item">
            <h2>Online Tempests by Firmware Version</h2>
            <div class="grid-content">
                <PieChart
                    :chart-data="firmwareChartData1"
                    :chartOptions="firmwareChartOptions"
                />
            </div>
            <p class="grid-content-footnote">
                <span>{{ onlineTempestCount }} <a @click="showOnlineOfflineGraph('st')" style="cursor: pointer; text-decoration: underline;">Online Tempests</a></span>
                <span>{{ latestTimestamp }}</span>
            </p>
        </div>
        <div class="grid-item">
          <h2>Online Stations by Firmware Version</h2>
          <div class="grid-content">
              <PieChart
                    :chart-data="firmwareChartData2"
                    :chartOptions="firmwareChartOptions"
              />
          </div>
          <p class="grid-content-footnote">
            <span>{{ onlineTempestCount }} <a @click="showOnlineOfflineGraph()" style="cursor: pointer; text-decoration: underline;">Online Stations</a></span>
            <span>{{ latestTimestamp }}</span>
          </p>
        </div>
        <div class="grid-item">
          <h2>Offline Tempests</h2>
            <div class="grid-content">
                <p>Offline Less Than A Year: {{ tempestOfflineLessThanAYear }}</p>
                <p>Offline A Year Or More: {{ tempestOfflineAYearOrMore }}</p>
            </div>
        </div>
        <div class="grid-item">
            <h2>Offline Stations</h2>
            <div class="grid-content">
                <p>Offline Less Than A Year: {{ stationOfflineLessThanAYear }}</p>
                <p>Offline A Year Or More: {{ stationOfflineAYearOrMore }}</p>
            </div>
        </div>
      </div>
    </div>
</template>

<script>
import Requestor from '../helpers/Requestor';
import PieChart from '../components/home/PieChart.vue';
import Day from '@/helpers/Day';

export default {
  name: "HomeView",
  components: {
    PieChart
  },
  data() {
    return {
      firmwareChartData1: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
            hoverBackgroundColor: [],
          },
        ],
      },
      firmwareChartData2: {
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
      onlineTempestCount: 0,
      latestTimestamp: '',
      tempestOfflineLessThanAYear: 0,
      tempestOfflineAYearOrMore: 0,
      stationOfflineLessThanAYear: 0,
      stationOfflineAYearOrMore: 0,
      accountsToday: 0,
      created7Days: 0,
      totalAccounts: 0,
      activeToday: 0,
      active3Days: 0,
      active7Days: 0,
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
          this.displayPieChart(data, 2);
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
          this.displayPieChart(data, 1);
        }
      } catch (error) {
        console.error('Error fetching network status:', error);
      }
    },
    displayPieChart(data, chartNumber) {
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

      const chartData = {
        labels,
        datasets: [
          {
            data: counts,
          },
        ],
      };

      if (chartNumber === 1) {
        this.firmwareChartData1 = chartData;
        this.onlineTempestCount = counts.reduce((sum, count) => sum + count, 0);
        this.tempestOfflineLessThanAYear = offlineLessThanAYear;
        this.tempestOfflineAYearOrMore = offlineAYearOrMore;
      } else if (chartNumber === 2) {
        this.firmwareChartData2 = chartData;
        this.onlineStationCount = counts.reduce((sum, count) => sum + count, 0);
        this.stationOfflineLessThanAYear = offlineLessThanAYear;
        this.stationOfflineAYearOrMore = offlineAYearOrMore;
      }

      this.latestTimestamp = this.getDisplayDate(latestTimestampString);
    },
    getLatestTSForNetworkReport(data) {
      let latestTimestamp = 0;
      let latestTimestampString = null;

      // Find the latest timestamp reported
      for (let x = 0; x < data.length; x++) {
        let currentTS = Day.getUTC(data[x].timestamp);

        if (currentTS > latestTimestamp) {
          latestTimestamp = currentTS;
          latestTimestampString = data[x].timestamp;
        }
      }

      return latestTimestampString;
    },
    showOnlineOfflineGraph(type) {
        if (type === "st") {
            this.$router.push("/online-offline?type=st");
        } else {
            this.$router.push("/online-offline");
        }
    },
    getDisplayDate(timestamp) {
      return Day.getUTCDate(timestamp);
    },
    updateTitle() {
      this.$emit('update-title', "Home");
    }
  },
  mounted() {
    this.updateTitle();
    this.requestor = new Requestor();
    this.fetchAccountsCreated();
    this.fetchActiveAccounts();
    this.getNetworkStatus();
    this.getNetworkStatusSt();
  }
};
</script>