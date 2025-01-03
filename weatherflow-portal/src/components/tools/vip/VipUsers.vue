<template>
    <div id="vip-users">
        <!-- Loader -->
        <Loader :isLoading="isLoading" />

        <button class="button" @click="goBack" style="margin-bottom: 15px;">Back</button>


        <!-- Table of users -->
        <h2 class="list-hdr">VIP Users</h2>
        <table v-if="!isLoading" class="table">
            <thead>
            <tr>
                <th>User ID</th>
                <th>Email</th>
                <th>Priority</th>
                <th>Client IDs</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(user, index) in users" :key="index">
                <td>
                <a :href="`/sw/users/${user.uid}`">{{ user.uid }}</a>
                </td>
                <td>{{ user.email }}</td>
                <td>{{ user.priority }}</td>
                <td v-html="formatClientIds(user.oauth_clients)"></td>
            </tr>
            </tbody>
        </table>
    </div>
  </template>

  <script>
    import Requestor from '@/helpers/Requestor';
    import Loader from '@/components/Loader.vue';

  export default {
    name: "VIPUsers",
    components: {
      Loader,
    },
    data() {
      return {
        isLoading: false,
        users: [],
        requestor: null,
      };
    },
    methods: {
      async fetchVIPUsers() {
        try {
          this.isLoading = true;
          const response = await this.requestor.makeGetRequestDev("users/vip", {}, true);
          console.log(response);
          if (response.data.status.status_code === 0) {
            this.users = response.data.users;
          }
          this.isLoading = false;
        } catch (error) {
          console.error("Error fetching VIP users:", error);
          this.isLoading = false;
        }
      },
      formatClientIds(oauthClients) {
        // Return an HTML string for each client link
        return oauthClients
          .map((client) => `<a href='/sw/OAuth/${client}' class='keys'>${client}</a>`)
          .join("");
      },
      goBack() {
        this.$router.push({ name: 'tools' });
      },
      updateTitle() {
        this.$emit("update-title", "VIP Users");
      },
    },
    mounted() {
      this.updateTitle();

      // Create your requestor instance
      this.requestor = new Requestor({});

      // Fetch the users
      this.fetchVIPUsers();
    },
  };
  </script>

  <style scoped>
  #vip-users {
    margin: 80px 20px;
    padding: 20px;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .list-hdr {
    margin: 0;
  }

  </style>