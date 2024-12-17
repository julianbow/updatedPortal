<template>
	<div class="hub-network">
	  <!-- Network Selector -->
	  <div id="networkSelector">
		<label for="network" class="chooseNetwork" >Choose a network: </label>
		<select
		  id="network"
		  name="network"
		  v-model="selectedNetwork"
		  @change="fetchData"
		>
		  <option
			v-for="network in networks"
			:key="network.value"
			:value="network.value"
			:data-serial="network.dataSerial"
		  >
			{{ network.name }}
		  </option>
		</select>
	  </div>


	  <!-- Hub Network List Table -->
	  <div id="hub-network-list">
		  <h3 class="list-hdr">{{ displayNetworkName }}</h3>
		<table class="table">
		  <thead>
			<tr>
			  <th>Purchased</th>
			  <th>Opt-In</th>
			</tr>
		  </thead>
		  <tbody>
			<tr v-for="(row, index) in tableData" :key="index">
			  <td>{{ row.purchased }}</td>
			  <td>{{ row.optIn }}</td>
			</tr>
		  </tbody>
		</table>
	  </div>
	</div>
  </template>

  <script>
  export default {
	name: 'HubNetwork',
	props: {
		requestor: Object,
	},
	data() {
	  return {
		networks: [
		  { value: "WeatherBug", name: "WeatherBug", dataSerial: "N-OGFhY2U0N" },
		  { value: "TempestOne", name: "TempestOne", dataSerial: "N-MmM0NjFmO" },
		  { value: "Clemson University", name: "Clemson University", dataSerial: "N-NTVlODg0Y" },
		  { value: "Amazon", name: "Amazon", dataSerial: "N-YzdlMmU3N" },
		  { value: "Amazon UK", name: "Amazon UK", dataSerial: "N-MzIyOTQ3M" },
		  { value: "WJAX", name: "WJAX (First Alert Neighborhood Weather Station Network)", dataSerial: "N-ZWY0MmJlM" },
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
		selectedNetwork: 'WeatherBug',
		tableData: [],
	  };
	},
	computed: {
	  // Computed property to get the name of the selected network
	  displayNetworkName() {
		const network = this.networks.find(n => n.value === this.selectedNetwork);
		return network ? network.name : 'Unknown';
	  },
	},
	methods: {
	  async fetchData() {
		const networkSerial = this.getSelectedNetworkSerial();
		if (!networkSerial) {
		  console.error("Invalid network selected.");
		  return;
		}

		const urlData = {
		  network_id: networkSerial,
		};

		try {
		  const response = await this.requestor.makeGetRequest("network/hubs", urlData);

		  // Check if the response structure matches expectations
		  if (response.data && response.data.status && response.data.status.status_code === 0) {
			const data = response.data;
			this.processTableData(data.opt_in_hubs, data.purchased_hubs);
		  }
		} catch (error) {
		  console.error("Error fetching data:", error);
		  this.showModal = true;
		}
	  },

	  processTableData(optInHubs, purchasedHubs) {
		const maxLen = Math.max(optInHubs.length, purchasedHubs.length);
		const newTableData = [];

		for (let i = 0; i < maxLen; i++) {
		  const purchased = purchasedHubs[i] || '';
		  const optIn = optInHubs[i] || '';

		  newTableData.push({
			purchased,
			optIn,
		  });
		}

		this.tableData = newTableData;
	  },

	  // Get the serial number corresponding to the selected network
	  getSelectedNetworkSerial() {
		const selected = this.networks.find(n => n.value === this.selectedNetwork);
		return selected ? selected.dataSerial : null;
	  }
	},
	watch: {
	  selectedNetwork(newNetwork, oldNetwork) {
		this.fetchData();
	  },
	},
	mounted() {
	  this.fetchData();
	},
  };
  </script>

  <style scoped>
  .chooseNetwork {
	color: #512b59;
	font-weight: bold;
  }

  .list-hdr {
	margin: 0;
  }

  #networkSelector {
	margin-bottom: 20px;
  }

  #networkSelector select {
	padding: 5px;
	border: 1px solid #ccc;
	border-radius: 4px;
	min-width: 200px;
  }
  </style>
