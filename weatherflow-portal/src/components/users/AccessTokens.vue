<template>
    <div class="access-tokens">
      <div class="list-hdr">Access Tokens ({{ accessTokens.length }})</div>
      <div id="general-list">
          <table v-if="accessTokens.length">
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
  props: {
    accessTokens: Array,
  },
  methods: {
    formatUTCDate(date) {
      return Day.getUTCDate(date);
    },
  }
};
</script>