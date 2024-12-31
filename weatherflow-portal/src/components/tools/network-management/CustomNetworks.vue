<template>
    <div id="custom-network">
      <!-- Main Content (Table View) -->
      <div id="main-content" v-if="!selectedNetworkId">
        <div class="loader" v-show="loading"></div>
        <div id="datatable-container">
          <div class="list-hdr">Custom Networks</div>
          <table class="table">
            <thead>
              <tr>
                <th>Network Name</th>
                <th>Network ID</th>
                <th>Contract Stations Count</th>
                <th>Purchased Hubs Count</th>
                <th>Opt-In Hubs Count</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="network in networks"
                :key="network.network_id"
                @click="selectNetwork(network)"
              >
                <td>{{ network.network_name }}</td>
                <td>{{ network.network_id }}</td>
                <td>{{ network.contract_stations_count }}</td>
                <td>{{ network.purchased_hubs_count }}</td>
                <td>{{ network.opt_in_hubs_count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Network Details -->
      <CustomNetworkDetails
        v-if="selectedNetworkId"
        :networkId="selectedNetworkId"
        :requestor="requestor"
      />
    </div>
  </template>

  <script>
  import CustomNetworkDetails from "./CustomNetworkDetails.vue";

  export default {
    name: "CustomNetworks",
    props: {
      requestor: Object,
    },
    data() {
      return {
        networks: null,
        selectedNetworkId: null,
        selectedNetworkName: "",
        loading: false,
      };
    },
    methods: {
      async fetchData() {
        this.loading = true;
        try {
          const response = await this.requestor.makeTempestInternalGetRequest(
            "tempestinternal/networks",
            {}
          );
          if (response.data.status.status_code === 0) {
            this.networks = response.data.networks;
          }
        } catch (error) {
          console.error("Error fetching networks:", error);
        } finally {
          this.loading = false;
        }
      },
      selectNetwork(network) {
        this.selectedNetworkId = network.network_id;
        this.selectedNetworkName = network.network_name;

        this.$router.push({
          path: `/tools/network-management/custom/${network.network_id}`,
        });
      },
      clearSelection() {
        this.selectedNetworkId = null;
        this.selectedNetworkName = "";

        const parentPath = this.$route.path.split("/").slice(0, -1).join("/");
        this.$router.push({ path: parentPath });
      },
      updateSelectionFromRoute(networkId) {
        if (networkId) {
          this.selectedNetworkId = networkId;
          const selectedNetwork =
            this.networks?.find((n) => n.network_id === networkId);
          if (selectedNetwork) {
            this.selectedNetworkName = selectedNetwork.network_name;
          }
        } else {
          this.selectedNetworkId = null;
          this.selectedNetworkName = "";
        }
      },
    },
    watch: {
      "$route.params.network_id": {
        immediate: true,
        handler(newNetworkId) {
          if (!newNetworkId) {
            if (!this.networks || this.networks.length === 0) {
              this.fetchData();
            }
          }
          this.updateSelectionFromRoute(newNetworkId);
        },
      },
    },
    components: {
      CustomNetworkDetails,
    },
  };
  </script>
