<template>
  <div id="users-view">
    <UserSearch @search="handleSearch" :searchError="searchError" />

    <!-- Only show the user list if no user is selected -->
    <UserList
      v-if="searchResults.length && !selectedUser"
      :searchResults="searchResults"
      :sortKey="sortKey"
      :sortDirection="sortDirection"
      :selectedUser="selectedUser"
      @selectUser="showUser"
    />

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
import UserList from './UsersList.vue';
import UserInfo from './UserInfo.vue';
import Requestor from '../../helpers/Requestor';

export default {
  components: {
    UserSearch,
    UserList,
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
        this.stations = response.data || [];
      } catch (error) {
        console.error('Error fetching user stations:', error);
      }
    },
    getSortClass(key) {
      return {
        up: this.sortDirection === 'asc' && this.sortKey === key,
      };
    },
  },
  mounted() {
    this.requestor = new Requestor();
  },
};
</script>
