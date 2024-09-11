<template>
    <div class="client-ids" v-if="clientIds.length > 0">
        <div class="list-hdr">
            OAuth Client Id's ({{ clientIds.length }})
        </div>
        <div id="general-list">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Client ID</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="client in clientIds" :key="client.client_id">
                        <td>{{ client.name }}</td>
                        <td>{{ client.client_id }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      clientIds: [],
    };
  },
  props: {
    requestor: Object,
    userId: String,
  },
  methods: {
    async fetchClientIds() {
      if (!this.requestor || !this.userId) {
        return;
      }

      try {
        const response = await this.requestor.makeOAuthIdGetRequest("oauth_clients/user/", this.userId);

        if (response.data.clients.length > 0) {
          this.clientIds = response.data.clients;
        }
      } catch (error) {
        console.error("Error fetching client ids", error);
      }
    },
  },
  watch: {
    userId() {
      this.fetchClientIds();
    },
    requestor() {
      if (this.requestor) {
        this.fetchClientIds();
      }
    }
  },
  mounted() {
    if (this.userId && this.requestor) {
      this.fetchClientIds();
    }
  },
};
</script>