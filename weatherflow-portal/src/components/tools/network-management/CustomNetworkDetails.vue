<template>
    <div id="network-details">
      <h1 class="list-hdr">{{ networkName }}</h1>
      <div class="loader" v-show="loading"></div>
      <div id="datatable-container">
        <!-- Clients Table -->
        <div
          v-if="clients.length > 0"
          class="table-wrapper"
        >
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
        <div
          v-if="stations.length > 0"
          class="table-wrapper"
        >
          <table class="table">
            <thead>
              <tr>
                <th>Stations in Network ({{ stations.length }})</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="stationId in stations" :key="stationId">
                <td>
                  <a
                    :href="`https://portal.weatherflow.com/sw/devices/station_id/${stationId}`"
                    target="_blank"
                  >
                    {{ stationId }}
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>

  <script>
  export default {
    name: "NetworkDetails",
    props: {
      networkId: String,
      requestor: Object
    },
    data() {
      return {
        clients: [],
        stations: [],
        networkName: null,
        loading: false,
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

/* Show the scrollbar on hover */
.table-wrapper:hover {
  overflow-y: auto; /* reveal it on hover */
}

/* For Firefox, hide the scrollbar except when hovering */
.table-wrapper {
  scrollbar-width: none;  /* hides by default in Firefox */
}
.table-wrapper:hover {
  scrollbar-width: thin;  /* changes to a thin scrollbar on hover in Firefox */
}

.table-wrapper::-webkit-scrollbar {
  width: 8px;
  background: transparent;
}

/* Transparent thumb by default (fully invisible). */
.table-wrapper::-webkit-scrollbar-thumb {
  background-color: transparent;
}

/* On hover, show a visible thumb */
.table-wrapper:hover::-webkit-scrollbar-thumb {
  background-color: #c0c0c0; /* or a color of your choice */
  border-radius: 4px;
}

.table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
}


  </style>
