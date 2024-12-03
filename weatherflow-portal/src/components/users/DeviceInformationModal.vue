<template>
  <div class="modal-ctn" v-if="isModalVisible">
    <div class="modal-content">
      <a class="modal-close" @click="closeDialog"></a>
      <h2 class="device-name">{{ device }}</h2>
      <div class="tab-bar">
        <a
          href="#"
          :class="{ selected: activeTab === 'bornOnDate' }"
          @click.prevent="switchTab('bornOnDate')"
        >Born On Date</a>
        <a
          href="#"
          :class="{ selected: activeTab === 'factoryTestResults' }"
          @click.prevent="switchTab('factoryTestResults')"
        >Factory Test Results</a>
      </div>

      <div class="tab-content">
        <!-- No Data Message for Born On Date -->
        <div v-if="activeTab === 'bornOnDate' && !bornOnDateData.length" class="no-data-message">
          <p>No data available for Born On Date.</p>
        </div>

        <!-- Born On Date Table -->
        <div class="table-container" v-if="bornOnDateData.length && activeTab === 'bornOnDate'">
          <table class="devices-table">
            <thead>
              <tr>
                <th title="Date">Date</th>
                <th title="Days Ago">Days Ago</th>
                <th title="Operation">Operation</th>
                <th title="Device ID">Device ID</th>
                <th title="Station ID">Station ID</th>
                <th title="Email">Email</th>
                <th title="User ID">User ID</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in bornOnDateData" :key="index">
                <td :title="formatTimestamp(row.time_epoch)">{{ formatTimestamp(row.time_epoch) }}</td>
                <td :title="row.days_ago_str">{{ row.days_ago_str }}</td>
                <td :title="row.operation">{{ row.operation }}</td>
                <td :title="row.device_id">{{ row.device_id }}</td>
                <td :title="row.station_id">{{ row.station_id }}</td>
                <td :title="row.email">{{ row.email }}</td>
                <td :title="row.user_id">{{ row.user_id }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- No Data Message for Factory Test Results -->
        <div v-if="activeTab === 'factoryTestResults' && !factoryTestResultsData.length" class="no-data-message">
          <p>No data available for Factory Test Results.</p>
        </div>

        <!-- Factory Test Results Table -->
        <div v-if="factoryTestResultsData.length && activeTab === 'factoryTestResults'">
          <h2>{{ factoryTimestamp }}</h2>
          <table class="devices-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Test Result</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in factoryTestResultsData" :key="index">
                <td>{{ row.name }}</td>
                <td>{{ row.testResult }}</td>
                <td>{{ row.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import Day from '@/helpers/Day';
export default {
  props: {
    requestor: Object,
  },
  data() {
    return {
      isModalVisible: false,
      device: null,
      activeTab: "bornOnDate",
      bornOnDateData: [],
      factoryTestResultsData: [],
      factoryTimestamp: null,
    };
  },
  methods: {
    openModal(device) {
      this.device = device;
      this.isModalVisible = true;
      this.fetchBornOnDateData();
    },
    closeDialog() {
      this.isModalVisible = false;
    },
    formatTimestamp(timestamp) {
      return Day.formatEpochTimeBornOn(timestamp);
    },
    switchTab(tab) {
      this.activeTab = tab;
      if (tab === "bornOnDate" && this.bornOnDateData.length === 0) {
        this.fetchBornOnDateData();
      } else if (tab === "factoryTestResults") {
        this.fetchFactoryTestResults();
      }
    },
    async fetchBornOnDateData() {
      const urlData = {
        serial_number: this.device,
      }
      const response = await this.requestor.makeTempestInternalGetRequest("tempestinternal/born_on_dates", urlData);
      try {
        if (response.data.status.status_code === 0 && response.data.born_on_records !== undefined) {
          this.bornOnDateData = response.data.born_on_records;
        }
      } catch (error) {
        console.error("Error fetching Born On Date data:", error);
      }
    },
    async fetchFactoryTestResults() {
      const urlData = {
        serial_number: this.device,
      };
      const response = await this.requestor.makeGetRequest("factory_test_results", urlData);
      try {
        if (response.data.status.status_code === 0 && response.data.tempest_final_list !== undefined) {
          this.factoryTestResultsData = response.data.tempest_final_list[0].results;
          this.factoryTimestamp = response.data.tempest_final_list[0].timestamp;
        }
      } catch (error) {
        console.error("Error fetching Factory Test Results data:", error);
      }
    },
  },
};
</script>

<style scoped>
.modal-content {
  max-width: 60%;
}

.table-container {
  max-width: 100%;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.devices-table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #f4f4f4;
}

th,
td {
  padding: 8px;
  border: 1px solid #ccc;
  text-align: left;
}

th {
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-data-message {
  text-align: center;
  margin: 20px;
  font-size: 1.2em;
  color: #666;
}


th:nth-child(1) { width: 3%; }
th:nth-child(2) { width: 3%; }
th:nth-child(3) { width: 1%; }
th:nth-child(4) { width: 1%; }
th:nth-child(5) { width: 1%; }
th:nth-child(6) { width: 4%; }
th:nth-child(7) { width: 4%; }

/* Add horizontal scrollbar styling */
.table-container::-webkit-scrollbar {
  height: 10px;
}

.table-container::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 5px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background-color: #555;
}

</style>
