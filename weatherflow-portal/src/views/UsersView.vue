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
      :formatTimestamp="formatTimestamp"
      @selectUser="showUser"
    />

    <!-- Show the selected user's information -->
    <UserInfo
      v-if="selectedUser"
      :selectedUser="selectedUser"
      :stations="stations"
      :formatTimestamp="formatTimestamp"
    />
  </div>
</template>

<script>
import '../assets/css/main.css';
import '../assets/css/users.css';
import UserSearch from '../components/users/UserSearch.vue';
import UserList from '../components/users/UsersList.vue';
import UserInfo from '../components/users/UserInfo.vue';
import Requestor from '@/helpers/Requestor';
import Day from '@/helpers/Day';

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
    async handleSearch(searchTerm) {
      this.$router.push({ path: `/users/search/${searchTerm}` });

      try {
        const urlData = {
          report_name: 'get_user_by_email',
          email_address: searchTerm
        };
        const response = await this.requestor.makePostRequest('report', urlData);
        this.searchResults = response.data;
        this.searchError = this.searchResults.length === 0;
        this.selectedUser = null;
      } catch (error) {
        this.searchError = true;
      }
    },
    async showUser(userId) {
      this.$router.push({ path: `/users/${userId}` });
      await this.fetchUserStations(userId);
    },
    async fetchUserStations(userId) {
      try {
        const response = await this.requestor.makeTempestInternalGetRequest(`tempestinternal/user/${userId}`);
        this.selectedUser = response.data.user;
        this.stations = response.data.user.stations || [];
      } catch (error) {
        console.error('Error fetching user stations:', error);
      }
    },
    formatTimestamp(timestamp) {
      return Day.formatTimestamp(timestamp);
    },
    updateTitle() {
      this.$emit('update-title', "Users");
    }
  },
  watch: {
    '$route.params.userId'(newUserId) {
      if (newUserId) {
        this.showUser(newUserId);
      }
    },
    '$route.params.term'(newSearchTerm) {
      if (newSearchTerm) {
        this.handleSearch(newSearchTerm);
      }
    }
  },
  mounted() {
    this.requestor = new Requestor();
    this.updateTitle();

    const userIdFromRoute = this.$route.params.userId;
    if (userIdFromRoute) {
      this.showUser(userIdFromRoute);
    }

    const searchTermFromRoute = this.$route.params.term;
    if (searchTermFromRoute) {
      this.handleSearch(searchTermFromRoute);
    }
  },
};
</script>
