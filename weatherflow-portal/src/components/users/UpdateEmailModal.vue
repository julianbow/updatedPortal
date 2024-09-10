<template>
    <div class="modal-ctn" v-if="isModalVisible">
      <div class="modal-content">
        <h2 class="email-name">{{ email }}</h2>
        <a href="#" class="modal-close" @click="closeEmailModal"></a>
        <!-- Tab Bar -->
        <div class="tab-bar">
          <a
            href="#"
            :class="{ selected: activeTab === 'update' }"
            @click.prevent="switchTab('update')"
          >Update</a>
          <a
            href="#"
            :class="{ selected: activeTab === 'delete' }"
            @click.prevent="switchTab('delete')"
          >Delete Account</a>
        </div>

        <!-- Update Email Tab Content -->
        <div v-if="activeTab === 'update'" class="tab-content">
          <div class="form-row">
            <label for="newEmail">New Email: </label>
            <input type="text" v-model="newEmail" size="25">
          </div>
          <div class="form-row">
            <label for="confirmEmail">Confirm New Email: </label>
            <input type="text" v-model="confirmEmail" size="25">
          </div>
          <div class="form-align-right">
            <input type="button" class="btn" @click="submitNewEmail" value="Update">
          </div>
        </div>

        <!-- Delete Account Tab Content -->
        <div v-if="activeTab === 'delete'" class="tab-content">
          <p><strong>Deleting an account removes all stations and data associated with this account.<br> This action cannot be undone.</strong></p>
          <div class="form-row">
            <label for="confirmEmail">Type Email Address to Delete: </label>
            <input type="text" v-model="deleteEmail" size="25">
          </div>
          <div class="form-align-right">
            <input type="button" class="btn" @click="submitDeleteAccount" value="Delete">
          </div>
        </div>
      </div>
    </div>
  </template>

<script>
import "@/assets/css/modal.css";
export default {
  props: {
    email: String,
    userId: String,
    requestor: Object,
  },
  data() {
    return {
      isModalVisible: false,
      newEmail: '',
      confirmEmail: '',
      deleteEmail: '',
      activeTab: 'update',
    };
  },
  methods: {
    openModal() {
      this.isModalVisible = true;
    },
    closeEmailModal() {
      this.isModalVisible = false;
    },
    validateEmail(email) {
      const re = /\S+@\S+\.\S+/;
      return re.test(email);
    },
    async submitNewEmail() {
      if (this.newEmail === this.confirmEmail && this.validateEmail(this.newEmail)) {
        const urlData = {
          user_id: this.userId,
          new_email: encodeURIComponent(this.confirmEmail)
        };

        try {
          const response = await this.requestor.makePutRequest('account_management/update_user_email', urlData);
          console.log(response)
          if (response.data.status_code === 0 && response.data.status_message === '0 SUCCESS') {
            alert('Email successfully updated!');

            this.closeEmailModal();
          } else {
            alert('Failed to update email.');
          }
        } catch (error) {
          console.error('Error updating email:', error);
          alert('An error occurred while updating the email.');
        }
      } else {
        alert('Emails do not match or are invalid.');
      }
    },
    async submitDeleteAccount() {
      if (this.deleteEmail === this.email) {
        const urlData = {
          user_id: this.userId,
        };

        if (confirm('Are you sure you want to delete this account?')) {
          try {
            const response = await this.requestor.makeDeleteRequest('account_management/delete_user', { data: urlData });
            if (response.data.status_code === 0) {
              alert('Account successfully deleted.');
              this.$emit('accountDeleted'); // Emit event to notify parent about account deletion
              this.closeEmailModal();
            } else {
              alert('Failed to delete account.');
            }
          } catch (error) {
            console.error('Error deleting account:', error);
            alert('An error occurred while deleting the account.');
          }
        }
      } else {
        alert('Email confirmation does not match account email or is invalid.');
      }
    },
    switchTab(tab) {
      this.activeTab = tab;
    }
  }
};
</script>
