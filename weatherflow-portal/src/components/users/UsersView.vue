<template>
  <div id="users-view">
    <UserSearch @search="handleSearch" :searchError="searchError" />

    <!-- Only show the user list if no user is selected -->
    <div v-if="searchResults.length && !selectedUser" id="user-list">
      <table>
        <thead>
          <tr>
            <th @click="sortTable('email_address')">
              Email Address
                <span class="sort" :class="{'up' : sortDirection === 'asc' && sortKey === 'email_address'}"></span>
            </th>
            <th @click="sortTable('created_date')">
              Created Date
              <span class="sort" :class="{'up' : sortDirection === 'asc' && sortKey === 'created_date'}"></span>
            </th>
            <th @click="sortTable('last_authenticated')">
              Last Authenticated
              <span class="sort" :class="{'up' : sortDirection === 'asc' && sortKey === 'last_authenticated'}"></span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in sortedResults"
            :key="user.user_id"
            @click="showUser(user.user_id, user)"
          >
            <td>{{ user.email_address }}</td>
            <td>{{ formatTimestamp(user.created_date) }}</td>
            <td>{{ formatTimestamp(user.last_authenticated) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Show the selected user's information -->
    <UserInfo
      v-if="selectedUser"
      :selectedUser="selectedUser"
      :stations="stations"
      :coastalExclusions="coastalExclusions"
      :formatTimestamp="formatTimestamp"
    />
  </div>
</template>


<script>
import '../../assets/css/users.css';
import '../../assets/css/main.css';
import UserSearch from './UserSearch.vue';
import UserInfo from './UserInfo.vue';
import Requestor from '../../helpers/Requestor';
import dayjs from 'dayjs';

export default {
  components: {
    UserSearch,
    UserInfo
  },
  data() {
    return {
      searchResults: [],
      selectedUser: null,
      userId: '',
      stations: [],
      searchError: false,
      sortKey: 'email_address',
      sortDirection: 'asc',
    };
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
  methods: {
    sortTable(key) {
      if (this.sortKey === key) {
        // Toggle sort direction if the same column is clicked
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        // Set the sort key and reset to ascending direction
        this.sortKey = key;
        this.sortDirection = 'asc';
      }
    },
    async handleSearch(urlData) {
      try {
        const response = await this.requestor.makePostRequest('report', urlData);
        this.searchResults = response.data;
        this.searchError = this.searchResults.length === 0;
        this.selectedUser = null;
      } catch (error) {
        this.searchError = true;
      }
    },
    async showUser(userId, userData = null) {
      this.selectedUser = userData || this.searchResults.find((user) => user.user_id === userId);

      if (this.selectedUser) {
        // Display user information

        await this.fetchUserStations(userId);
      }
    },
    async fetchUserStations(userId) {
      try {
        const urlData = {
          report_name: 'get_user',
          user_id: userId,
        };
        const response = await this.requestor.makePostRequest('report', urlData);
        this.stations = response.data || [];
      } catch (error) {
        console.error('Error fetching user stations:', error);
      }
    },
    formatTimestamp(timestamp) {
      return dayjs(timestamp).format('MM/DD/YY h:mm A');
    },
  },
  mounted() {
    this.requestor = new Requestor();
  },
};
</script>
