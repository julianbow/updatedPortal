<template>
  <div v-if="accessTokens.length > 0" class="access-tokens">
    <div class="list-hdr">Access Tokens ({{ accessTokens.length }})</div>
    <div id="general-list">
      <table>
        <thead>
          <tr>
            <th>Application</th>
            <th>Created (UTC)</th>
            <th>Last Used (UTC)</th>
            <th>Token</th>
          </tr>
        </thead>
        <tr v-for="token in accessTokens" :key="token.token">
          <td>{{ token.name }}</td>
          <td>{{ formatUTCDate(token.created_date) }}</td>
          <td>{{ formatUTCDate(token.last_used_date) }}</td>
          <td class="token-display">{{ token.token }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import Day from '@/helpers/Day';
export default {
  data() {
    return {
      accessTokens: [],
    };
  },
  props: {
    requestor: Object,
    userId: String,
  },
  methods: {
    formatUTCDate(date) {
      return Day.getUTCDate(date);
    },
    async fetchAccessTokens() {
      if (!this.requestor || !this.userId) {
        return;
      }

      try {
        const urlData = {
          report_name: "get_user_access_tokens",
          user_id: this.userId,
        };

        const response = await this.requestor.makePostRequest("report", urlData);

        if (response.data.length > 0) {
          this.accessTokens = response.data;
        }
      } catch (error) {
        console.error("Error fetching access tokens", error);
      }
    },
  },
  watch: {
    userId() {
      this.fetchAccessTokens();
    },
    requestor() {
      if (this.requestor) {
        this.fetchAccessTokens();
      }
    }
  },
  mounted() {
    if (this.userId && this.requestor) {
      this.fetchAccessTokens();
    }
  },
};
</script>