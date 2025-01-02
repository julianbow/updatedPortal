<template>
    <div id="network-details">
      <button class="button uploadContract" @click="toggleModal">Upload Contract Stations</button>
      <h1 class="list-hdr">{{ networkName }}</h1>
      <div class="loader" v-show="loading"></div>
      <div id="datatable-container">
        <!-- Clients Table -->
        <div v-if="clients.length > 0" class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Clients</th>
                <th>Client ID</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="client in clients" :key="client.client_id">
                <td>{{ client.name }}</td>
                <td>
                  <a :href="`/sw/OAuth/${client.client_id}`" target="_blank">
                    {{ client.client_id }}
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Stations Table -->
        <div v-if="stations.length > 0" class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Stations in Network ({{ stations.length }})</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stationId in stations" :key="stationId">
                <td>
                  <a :href="`/devices/station_id/${stationId}`"> {{ stationId }} </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Upload Contract Modal -->
      <UploadContractModal
        v-if="showModal"
        :showModal="showModal"
        :stations="stations"
        :requestor="requestor"
        :networkId="networkId"
        @close="toggleModal"
      />
    </div>
  </template>

  <script>
  import UploadContractModal from "./UploadContractModal.vue";

  export default {
    name: "NetworkDetails",
    components: {
      UploadContractModal,
    },
    props: {
      networkId: String,
      requestor: Object,
    },
    data() {
      return {
        clients: [],
        stations: [],
        networkName: null,
        loading: false,
        showModal: false, // Modal visibility state
      };
    },
    methods: {
      async fetchNetworkDetails() {
        this.loading = true;
        try {
          const response = await this.requestor.makeGetRequestDev(
            `networks/${this.networkId}`,
            {},
            true
          );
          if (response.data.status.status_code === 0) {
            const network = response.data.network;
            this.clients = network.network_clients;
            this.stations = network.network_stations;
            this.networkName = network.network_name;
          }
        } catch (error) {
          console.error("Error fetching network details:", error);
        } finally {
          this.loading = false;
        }
      },
      toggleModal() {
        this.showModal = !this.showModal;
      }
    },
    mounted() {
      this.fetchNetworkDetails();
    },
  };
  </script>

  <style scoped>
  .list-hdr {
    margin: 0;
  }
  .table-wrapper {
    max-height: 300px;
    overflow-y: hidden;
    position: relative;
    box-sizing: border-box;
  }

  .table-wrapper:hover {
    overflow-y: auto;
  }

  .table-wrapper {
    scrollbar-width: none;
  }
  .table-wrapper:hover {
    scrollbar-width: thin;
  }

  .table-wrapper::-webkit-scrollbar {
    width: 8px;
    background: transparent;
  }

  .table-wrapper::-webkit-scrollbar-thumb {
    background-color: transparent;
  }

  .table-wrapper:hover::-webkit-scrollbar-thumb {
    background-color: #c0c0c0;
    border-radius: 4px;
  }

  .table thead th {
    position: sticky;
    top: 0;
    z-index: 2;
  }

  .uploadContract {
    margin-bottom: 10px;
  }
  </style>
