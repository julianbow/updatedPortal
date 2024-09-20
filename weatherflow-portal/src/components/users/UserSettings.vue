<template>
    <div class="modal-ctn" v-if="isModalVisible">
        <div class="modal-content">
            <h2 class='settings-name'>User Settings</h2>
            <a class="modal-close" @click="closeEmailModal"></a>
            <div v-if="userSettings.length > 0" class="user-settings-modal">
               <p class="settings-obj">{{ this.userSettings }}</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      userSettings: null,
      isModalVisible: false,
    };
  },
  props: {
    requestor: Object,
    userId: String,
  },
  methods: {
    openModal() {
      this.isModalVisible = true;
      this.fetchUserSettings();
    },
    closeEmailModal() {
      this.isModalVisible = false;
    },
    async fetchUserSettings() {
      try {
        const response = await this.requestor.makeGetRequest("user_settings", { user_id: this.userId });
        if (response.data.status.status_code === 0) {
          if (response.data.settings) {
            this.userSettings = JSON.stringify(response.data.settings, null, 4);
          }
        }
      } catch (error) {
        console.error("Error fetching user settings", error);
      }
    }
  }
}
</script>