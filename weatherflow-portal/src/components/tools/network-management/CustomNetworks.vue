<template>
    <div id="custom-network">
        <div id="network-header">
            <h1 id="networkId"></h1>
        </div>
        <div id="main-content">
            <div class="loader" style="display: none;"></div>
            <div id="datatable-container">
                <div class="list-hdr">Custom Networks</div>
                <table class="table">
                    <thead>
                        <th>Network Name</th>
                        <th>Network ID</th>
                        <th>Contract stations Count</th>
                        <th>Purchased Hubs Count</th>
                        <th>Opt-In Hubs Count</th>
                    </thead>
                    <tbody>
                        <tr v-for="network in networks" :key="network.networkId">
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
    </div>
</template>

<script>
export default {
    name: "CustomNetworks",
    props: {
		requestor: Object,
	},
    data() {
        return {
            networks: null
        }
    },
    methods: {
        async fetchData() {
            const response  = await this.requestor.makeTempestInternalGetRequest("tempestinternal/networks", {});
            try {
                if (response.data.status.status_code === 0) {
                    this.networks = response.data.networks;
                }
            } catch (error) {
                console.log(error);
            }
        }
    },
    mounted() {
	  this.fetchData();
	}
}
</script>
