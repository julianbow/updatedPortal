<template>
    <div id="user-list">
      <table>
        <thead>
          <tr>
            <th @click="sortTable('email_address')">
              Email Address
              <span class="sort" :class="getSortClass('email_address')"></span>
            </th>
            <th @click="sortTable('created_date')">
              Created Date
              <span class="sort" :class="getSortClass('created_date')"></span>
            </th>
            <th @click="sortTable('last_authenticated')">
              Last Authenticated
              <span class="sort" :class="getSortClass('last_authenticated')"></span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in sortedResults"
            :key="user.user_id"
            @click="showUser(user.user_id, user)"
            :class="{ 'selected': user.user_id === selectedUser?.user_id }"
          >
            <td>{{ user.email_address }}</td>
            <td>{{ formatTimestamp(user.created_date) }}</td>
            <td>{{ formatTimestamp(user.last_authenticated) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>

<script>
import dayjs from 'dayjs';
export default {
  props: {
    searchResults: Array,
    selectedUser: Object,
    initialSortKey: {
      type: String,
      default: 'email_address',
    },
    initialSortDirection: {
      type: String,
      default: 'asc',
    },
  },
  data() {
    return {
      sortKey: this.initialSortKey,
      sortDirection: this.initialSortDirection,
    };
  },
  methods: {
    sortTable(key) {
      if (this.sortKey === key) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortDirection = 'asc';
      }
    },
    showUser(userId, user) {
      this.$emit('selectUser', userId, user);
    },
    formatTimestamp(timestamp) {
      return dayjs(timestamp).format('MM/DD/YY h:mm A');
    },
    getSortClass(key) {
      return {
        up: this.sortDirection === 'asc' && this.sortKey === key,
      };
    },
  },
  computed: {
    sortedResults() {
      return this.searchResults.slice().sort((a, b) => {
        let modifier = this.sortDirection === 'asc' ? 1 : -1;
        if (a[this.sortKey] < b[this.sortKey]) return -1 * modifier;
        if (a[this.sortKey] > b[this.sortKey]) return 1 * modifier;
        return 0;
      });
    }
  },
};
</script>