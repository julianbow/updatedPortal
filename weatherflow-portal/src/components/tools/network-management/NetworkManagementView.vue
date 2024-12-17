<!-- src/components/NetworkManagement.vue -->
<template>
    <div id="network-management">
      <!-- Back Button -->
      <button class="button" @click="goBack">Back</button>

      <!-- Tabs -->
      <div class="tabs">
        <button
          :class="{ active: activeTab === 'cs' }"
          @click="setTab('cs')">
          Customer Service
        </button>
        <button
          :class="{ active: activeTab === 'prod' }"
          @click="setTab('prod')">
          Production
        </button>
        <button
          :class="{ active: activeTab === 'hub' }"
          @click="setTab('hub')">
          Hub Network List
        </button>
        <button
          :class="{ active: activeTab === 'custom' }"
          @click="setTab('custom')">
          Custom Networks
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Customer Service and Production Tabs -->
        <div class="network-container" :class="{ blurred: showModal }" v-if="activeTab === 'prod' || activeTab === 'cs'">
          <h3 class="title">Select Network and Input Hub Serial Number</h3>
          <div id="form-container">
            <div id="networkSelector">
              <label for="network" class="chooseNetwork">Choose a network: </label>
              <select id="network" name="network" v-model="selectedNetwork">
                <option
                  v-for="network in currentNetworks"
                  :key="network.value"
                  :value="network.value"
                  :data-serial="network.dataSerial">
                  {{ network.name }}
                </option>
              </select>
            </div>
            <div id="serialNumberForm">
              <label for="hubSerialNumber" class="serialNumber">Hub Serial Number: </label>
              <input
                type="text"
                id="hubSerialNumber"
                v-model="hubSerialNumber"
                name="hubSerialNumber"
                @keyup.enter="handleSubmit"
              />
              <button id="submit" @click="handleSubmit">Submit</button>
            </div>
          </div>

          <div id="datatable-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Network</th>
                  <th>Timestamp</th>
                  <th>Serial Number</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(entry, index) in tableData" :key="index">
                  <td>{{ entry.network }}</td>
                  <td>{{ formatTimestamp(entry.timestamp) }}</td>
                  <td>{{ entry.serial_number }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Hub Network Tab Content -->
        <div v-show="activeTab === 'hub'">
          <HubNetworkList :requestor="request"/>
        </div>

        <div v-show="activeTab === 'custom'">
          <CustomNetworks :requestor="request"/>
        </div>

        <!-- Modal -->
        <div class="frame" v-if="showModal">
          <div class="modal">
            <span class="title">Oh snap!</span>
            <p>
              We encountered an issue while attempting to add this hub to the database. Please verify that the serial number is correctly matched with the appropriate network.
            </p>
            <div class="dismissButton" @click="dismissModal">Dismiss</div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script>
  // Import necessary classes
  import Requestor from '@/helpers/Requestor.js';
  import dayjs from 'dayjs';
  import HubNetworkList from './HubNetworkList.vue';
  import CustomNetworks from './CustomNetworks.vue';

  export default {
    name: 'NetworkManagement',
    components: {
      HubNetworkList,
      CustomNetworks
    },
    data() {
      return {
        activeTab: 'cs', // default tab
        prodNetworks: [
          { value: "WeatherBug", name: "WeatherBug", dataSerial: "N-OGFhY2U0N" },
          { value: "TempestOne", name: "TempestOne", dataSerial: "N-MmM0NjFmO" },
          { value: "Clemson University", name: "Clemson University", dataSerial: "N-NTVlODg0Y" },
          { value: "Amazon", name: "Amazon", dataSerial: "N-YzdlMmU3N" },
          { value: "Amazon UK", name: "Amazon UK", dataSerial: "N-MzIyOTQ3M" },
          { value: "Amazon CA", name: "Amazon CA", dataSerial: "N-YjBhYzdhN" },
          { value: "WJAX", name: "WJAX", dataSerial: "N-ZWY0MmJlM" },
          { value: "Schools", name: "Schools", dataSerial: "N-ZGM1MjBhO" },
          { value: "TempestOne-Prologis", name: "TempestOne-Prologis", dataSerial: "N-ZDlmOGRiO" },
          { value: "MyRadar Purchased", name: "MyRadar Purchased", dataSerial: "N-YWJlMWU2Z" },
          { value: "Purple Air", name: "Purple Air", dataSerial: "N-OTgyOTU4O" },
          { value: "Grey TV", name: "Grey TV", dataSerial: "N-ZTk1MTcwM" },
          { value: "KHOU TV", name: "KHOU TV", dataSerial: "N-ZmIzMThkZ" },
          { value: "KKTV", name: "KKTV", dataSerial: "N-NWViMWU4Z" },
          { value: "KLBK TV", name: "KLBK TV", dataSerial: "N-ZjQwYTAxY" },
          { value: "Life360", name: "Life360", dataSerial: "N-YmY4Njk3M" },
        ],
        csNetworks: [
          { value: "WeatherBug", name: "WeatherBug", dataSerial: "N-OGFhY2U0N" },
          { value: "TempestOne", name: "TempestOne", dataSerial: "N-MmM0NjFmO" },
          { value: "Clemson University", name: "Clemson University", dataSerial: "N-NTVlODg0Y" },
          { value: "Amazon", name: "Amazon", dataSerial: "N-YzdlMmU3N" },
          { value: "Schools", name: "Schools", dataSerial: "N-ZGM1MjBhO" },
          { value: "MyRadar Opt-Ins", name: "MyRadar Opt-Ins", dataSerial: "N-ZTZlOTZkO" },
          { value: "Purple Air", name: "Purple Air", dataSerial: "N-OTgyOTU4O" },
        ],
        selectedNetwork: 'WeatherBug', // default network
        hubSerialNumber: '',
        tableData: [], // array of { network, timestamp, serial_number }
        showModal: false,
        request: new Requestor({}),
        type: null,
        storageData: []
      };
    },
    computed: {
      currentNetworks() {
        return this.activeTab === 'prod' ? this.prodNetworks : this.csNetworks;
      }
    },
    methods: {
      setTab(tabName) {
        if (!['cs', 'prod', 'hub', 'custom'].includes(tabName)) return;
        this.activeTab = tabName;
        this.$router.push({ query: { ...this.$route.query, tab: tabName } });
        this.initializeTab();
      },
      initializeTab() {
        if (this.activeTab === 'prod') {
          this.type = "purchased";
        } else if (this.activeTab === 'cs') {
          this.type = "opt-in";
        }

        // Define tab-specific keys
        const networkKey = `${this.activeTab}_network`;
        const dataPrefix = `${this.activeTab}_`;

        // Get current network from sessionStorage
        let currentNetwork = sessionStorage.getItem(networkKey);
        if (!currentNetwork) {
          this.selectedNetwork = "WeatherBug";
          sessionStorage.setItem(networkKey, "WeatherBug");
        } else {
          this.selectedNetwork = currentNetwork;
        }

        // Get current list from sessionStorage
        const dataKey = `${dataPrefix}${this.selectedNetwork}`;
        let currentList = sessionStorage.getItem(dataKey);
        if (currentList) {
          try {
            this.storageData = JSON.parse(currentList);
            this.tableData = [...this.storageData];
          } catch (e) {
            console.error("Failed to parse sessionStorage data:", e);
            this.storageData = [];
            this.tableData = [];
          }
        } else {
          this.storageData = [];
          this.tableData = [];
        }
      },
      async handleSubmit() {
        if (!this.hubSerialNumber.trim()) {
          alert("Please enter a Hub Serial Number.");
          return;
        }
        const hubSerialNumber = this.hubSerialNumber.trim();
        const selectedOption = this.currentNetworks.find(n => n.value === this.selectedNetwork);
        const selectedOptionSerial = selectedOption ? selectedOption.dataSerial : null;
        const network = this.selectedNetwork;
        const currentTime = dayjs().format("M/D/YY h:mm a");

        if (!selectedOptionSerial) {
          console.error("Invalid network selected.");
          return;
        }

        await this.submitHubSerial(hubSerialNumber, selectedOptionSerial, currentTime);
        this.setHubStorage(hubSerialNumber, network, currentTime);
        this.hubSerialNumber = '';
      },
      async submitHubSerial(hubSerialNumber, selectedOptionSerial, timestamp) {
        const hubs = hubSerialNumber.split(' ').filter(Boolean);

        const urlData = {
          network_id: selectedOptionSerial,
          hubs: []
        };

        // Check if there is more than one hub
        if (hubs.length > 1) {
          for (let i = 0; i < hubs.length; i++) {
            urlData.hubs.push({
              serial_number: hubs[i],
              type: this.type
            });
          }
        } else {
          urlData.hubs.push({
            serial_number: hubSerialNumber,
            type: this.type
          });
        }

        try {
          const data = await this.request.makePostRequest("network/hubs/v2", urlData);
          if (data.status.status_code === 0) {
            this.drawTable(urlData, timestamp);
          } else {
            this.showModal = true;
          }
        } catch (error) {
          console.error("Error in makePostRequest:", error);
          this.showModal = true;
        }
      },
      setHubStorage(hubSerialNumber, network, timestamp) {
        const hubs = hubSerialNumber.split(' ').filter(Boolean);
        const currentNetwork = sessionStorage.getItem(`${this.activeTab}_network`);

        if (currentNetwork === network) {
          if (hubs.length > 1) {
            for (let i = 0; i < hubs.length; i++) {
              this.storageData.unshift({
                network: network, // Include network name
                serial_number: hubs[i],
                timestamp: timestamp,
              });
            }
          } else {
            this.storageData.unshift({
              network: network, // Include network name
              serial_number: hubSerialNumber,
              timestamp: timestamp,
            });
          }

          // Define tab-specific key
          const dataKey = `${this.activeTab}_${network}`;

          // Save updated data to sessionStorage
          sessionStorage.setItem(dataKey, JSON.stringify(this.storageData));
          this.tableData = [...this.storageData]; // Update table data
        }
      },
      drawTable(data, timestamp) {
        if (data.hubs.length > 0) {
          const network = this.findNetwork(data.network_id);
          const newEntries = data.hubs.map(hub => ({
            network: network, // Ensure network name is included
            timestamp: timestamp,
            serial_number: hub.serial_number
          }));
          this.tableData = [...newEntries, ...this.tableData];
        }
      },
      findNetwork(value) {
        const networks = {
          "N-OGFhY2U0N": "WeatherBug",
          "N-MmM0NjFmO": "TempestOne",
          "N-YzdlMmU3N": "Amazon",
          "N-YjBhYzdhN": "Amazon CA",
          "N-NTVlODg0Y": "Clemson University",
          "N-ZWY0MmJlM": "WJAX",
          "N-MzIyOTQ3M": "Amazon UK",
          "N-ZGM1MjBhO": "Schools",
          "N-ZDlmOGRiO": "TempestOne-Prologis",
          "N-YWJlMWU2Z": "MyRadar Purchased",
          "N-ZTZlOTZkO": "MyRadar Opt-Ins",
          "N-OTgyOTU4O": "Purple Air",
          "N-ZTk1MTcwM": "Grey TV",
          "N-ZmIzMThkZ": "KHOU TV",
          "N-NWViMWU4Z": "KKTV",
          "N-ZjQwYTAxY": "KLBK TV",
          "N-YmY4Njk3M": "Life360",
        };

        return networks[value] || 'Unknown';
      },
      dismissModal() {
        this.showModal = false;
      },
      formatTimestamp(timestamp) {
        return dayjs(timestamp).format("M/D/YY h:mm a");
      },
      updateTitle() {
        this.$emit("update-title", "Network Management");
      },
      goBack() {
        this.$router.push({ name: 'tools' });
      },
    },
    watch: {
      '$route.query.tab': {
        immediate: true,
        handler(newValue) {
          if (newValue && (newValue === 'prod' || newValue === 'cs')) {
            this.activeTab = newValue;
            this.initializeTab();
          }
        }
      },
      selectedNetwork(newNetwork) {
        const networkKey = `${this.activeTab}_network`;
        const dataKey = `${this.activeTab}_${newNetwork}`;

        // Update the selected network in sessionStorage
        sessionStorage.setItem(networkKey, newNetwork);

        // Load data for the new selected network
        let currentList = sessionStorage.getItem(dataKey);
        if (currentList) {
          try {
            this.storageData = JSON.parse(currentList);
            this.tableData = [...this.storageData];
          } catch (e) {
            console.error("Failed to parse sessionStorage data:", e);
            this.storageData = [];
            this.tableData = [];
          }
        } else {
          this.storageData = [];
          this.tableData = [];
        }
      }
    },
    mounted() {
      this.updateTitle();
      const tabFromUrl = this.$route.query.tab;
      if (tabFromUrl && ['prod', 'cs', 'hub', 'custom'].includes(tabFromUrl)) {
        this.activeTab = tabFromUrl;
      } else {
        this.$router.replace({ query: { ...this.$route.query, tab: this.activeTab } });
      }
      this.initializeTab();
    }
  }
  </script>

  <style scoped>
  #network-management {
    margin: 80px 20px;
    padding: 20px;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .tabs {
    display: flex;
    justify-content: center;
    border-bottom: 1px solid #ccc;
  }

  .tabs button {
    padding: 10px 20px;
    border: none;
    background: none;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    font-size: 16px;
    color: #512b59;
  }

  .tabs button.active {
    border-bottom: 2px solid #512b59;
    font-weight: bold;
  }

  .tab-content {
    text-align: center;
    padding: 20px 0;
  }

  .network-container {
    transition: filter 0.3s ease;
  }

  .blurred {
    filter: blur(2px);
  }

  .title {
    color: #512b59;
  }

  #form-container {
    display: flex;
    justify-content: space-evenly;
    margin-bottom: 20px;
  }

  #networkSelector, #serialNumberForm {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  #networkSelector select, #serialNumberForm input {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  #serialNumberForm button {
    padding: 5px 10px;
    background-color: #512b59;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 4px;
  }

  #serialNumberForm button:hover {
    background-color: #555;
  }

  .network-name {
    margin-top: 10px;
    margin-bottom: 20px;
    font-size: 1.1em;
  }

  .frame {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 50%;
    text-align: center;
  }

  .modal img {
    margin-bottom: 10px;
  }

  .dismissButton {
    margin-top: 10px;
    padding: 5px 10px;
    background-color: #333;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 4px;
  }

  .dismissButton:hover {
    background-color: #555;
  }
  </style>
