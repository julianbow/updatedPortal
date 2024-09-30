<template>
    <div id="applications-view">
      <div id="applications-list">
        <table>
          <thead>
            <tr>
              <th>Application</th>
              <th>Email</th>
              <th>Note</th>
              <th>Users</th>
            </tr>
          </thead>
          <tbody v-for="(app, index) in applicationData" :key="index">
            <tr @click="toggleDetails(app.client_id)" class="app-row">
              <td>{{ app.name }}</td>
              <td>{{ app.email_address }}</td>
              <td>{{ app.note }}</td>
              <td>{{ app.access_tokens.length }}</td>
            </tr>

            <!-- Show this table when a row is clicked -->
            <tr v-show="selectedApp === app.client_id" id="application-details">
              <td colspan="1"><span :class="getScopeClass(app.scopes)"></span></td>
              <td colspan="1" v-html="getArrayValue(app.scopes)"></td>
              <td colspan="2" v-html="getApiKey(app.api_keys)"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>

  <script>
  import Requestor from "../helpers/Requestor";
  import "@/assets/css/applications.css";

  export default {
    data() {
      return {
        applicationData: null,
        selectedApp: null, // Track the currently selected application
        loading: true,
      };
    },
    methods: {
      async getData() {
        const urlData = {
          include_all_applications: true,
          include_all_tokens: true,
          include_all_api_keys: true,
        };

        const response = await this.requestor.makeGetRequest("application", urlData);
        try {
          if (response.data.status.status_code === 0) {
            this.applicationData = response.data.applications;
          } else {
            this.loading = false;
          }
        } catch (error) {
          this.loading = false;
        }
      },
      getArrayValue(value) {
        if (value) {
          return value.map(scope => `<span>${scope}</span>`).join("");
        }
        return "";
      },
      getApiKey(value) {
        if (value && value.length) {
          return value.map(api => `<span>${api.api_key}</span>`).join("");
        }
        return "";
      },
      getScopeClass(value) {
        return value.includes("public_obs") ? "public-obs" : "";
      },
      toggleDetails(id) {
        console.log("Toggled details for ID:", id);
        this.selectedApp = this.selectedApp === id ? null : id;
      },
    },
    mounted() {
      this.requestor = new Requestor();
      this.getData();
    },
  };
  </script>