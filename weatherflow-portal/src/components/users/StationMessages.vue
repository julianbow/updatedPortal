<template>
    <div class="modal-ctn" v-if="isModalVisible">
      <div class="modal-content">
        <a href="#" class="modal-close" @click="closeDialog"></a>
        <h2 class="station-messages-name">{{ stationName }}</h2>
        <div class="buttons" :data-station-name="stationName">
          <h2 class="viewTimes">Timezone:</h2>
          <button id="stationButton" class="timeButtons" @click="fetchMessages('station')">Station</button>
          <button id="browserButton" class="timeButtons" @click="fetchMessages('browser')">Browser</button>
          <button id="utcButton" class="timeButtons" @click="fetchMessages('utc')">UTC</button>
        </div>
        <div class="station-messages-content">
          <template v-if="notifications && notifications.length">
            <div v-for="(notification, index) in notifications" :key="index" class="message">
              <div v-if="notification.utc" class="day">{{ notification.utc }}</div>
              <div class="message-info">
                {{ notification.body }}
                <span class="msg-time">{{ notification.utc }}</span>
              </div>
              <div class="message-meta">
                <span class="notification-info" :class="getNotificationClass(notification.user_notifications_on)">
                  {{ notification.user_notifications_on ? 'Notifications On' : 'Notifications Off' }}
                </span>
                <span class="notification-info" :class="getNotificationClass(notification.sent)">
                  {{ notification.sent ? 'Sent' : 'Unsent' }}
                </span>
                <span class="notification-info" :class="getNotificationCountsClass(notification)">
                  {{ notification.fcm_target_success_count || 0 }} / {{ notification.fcm_target_count || 0 }}
                </span>
              </div>
            </div>
          </template>
          <p v-else>No messages found for this station.</p>
        </div>
      </div>
    </div>
  </template>

<script>

export default {
  props: {
    requestor: Object,
    stationId: Number,
    stationName: String
  },
  data() {
    return {
      isModalVisible: false,
      notifications: [],
      currentDay: ''
    };
  },
  methods: {
    openModal() {
      this.fetchMessages('station');
      this.isModalVisible = true;
    },
    closeDialog() {
      this.isModalVisible = false;
    },
    async fetchMessages(type) {
      const urlData = { station_id: this.stationId };
      try {
        const response = await this.requestor.makeGetRequest('notifications', urlData);
        if (response.data.status.status_code === 0) {
          this.notifications = this.processNotifications(response.data.user_notifications, type);
        } else {
          alert("No messages found for this station.");
        }
      } catch (error) {
        console.log(error);
      }
    },
    processNotifications(notifications) {
      return notifications.reverse().map(notification => {
        if (notification.utc && notification.tz) {
          notification.formattedTime = notification.utc;
        }
        return notification;
      });
    },
    getNotificationClass(isOn) {
      return isOn ? 'notification-green' : 'notification-red';
    },
    getNotificationCountsClass(notification) {
      return notification.fcm_target_success_count === notification.fcm_target_count
        ? 'notification-green'
        : 'notification-red';
    }
  }
};
</script>