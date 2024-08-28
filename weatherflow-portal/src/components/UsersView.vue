<template>
    <div id="users-view">
      <UserSearch @search="handleSearch" :searchError="searchError" />

      <div v-if="searchResults.length" id="user-list">
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
              @click="selectUser(user.user_id)"
            >
              <td>{{ user.email_address }}</td>
              <td>{{ formatTimestamp(user.created_date) }}</td>
              <td>{{ formatTimestamp(user.last_authenticated) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="selectedUser" id="user-info">
        <h2>{{ selectedUser.email_address }}</h2>
        <p>User ID: {{ selectedUser.user_id }}</p>
        <p>Created Date: {{ formatTimestamp(selectedUser.created_date) }}</p>
        <p>Last Authenticated: {{ formatTimestamp(selectedUser.last_authenticated) }}</p>

        <div id="stations" v-if="stations.length">
          <h3>User Stations</h3>
          <div
            v-for="station in stations"
            :key="station.location_id"
            class="station"
          >
            <h4>{{ station.location_name }}</h4>
            <p>Created: {{ formatTimestamp(station.created) }}</p>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script>
  import '../assets/css/users.css';
  import UserSearch from './UserSearch.vue';
  import Requestor from '../helpers/Requestor';
  import dayjs from 'dayjs';

  export default {
    components: {
      UserSearch,
    },
    data() {
      return {
        searchResults: [],
        selectedUser: null,
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
        } catch (error) {
          console.error('Error searching users:', error);
          this.searchError = true;
        }
      },
      async selectUser(userId) {
        this.selectedUser = this.searchResults.find((user) => user.user_id === userId);
        await this.fetchUserStations(userId);
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