<template>
    <div id="users-view">
        <UserSearch @search="handleSearch" :searchError="searchError" />

        <!-- Only show the user list if no user is selected -->
        <div v-if="searchResults.length && !selectedUser" id="user-list">
        <table>
            <thead>
            <tr>
                <th>Email Address</th>
                <th>Created Date</th>
                <th>Last Authenticated</th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="user in searchResults"
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
    };
  },
  methods: {
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
        console.log('User stations:', response);
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
