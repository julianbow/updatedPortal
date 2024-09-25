<template>
    <div class="modal-ctn" v-if="isModalVisible">
      <div class="modal-content messages">
        <span class="modal-close" @click="closeDialog"></span>
        <h2 class="station-messages-name">{{ stationName }}</h2>
        <div class="buttons">
          <h3 class="viewTimes">Timezone:</h3>
          <button
            id="stationButton"
            class="timeButtons"
            :class="{ selected: selectedTimeZone === 'station' }"
            @click="getTime('station')"
          >Station</button>
          <button
            id="browserButton"
            class="timeButtons"
            :class="{ selected: selectedTimeZone === 'browser' }"
            @click="getTime('browser')"
          >Browser</button>
          <button
            id="utcButton"
            class="timeButtons"
            :class="{ selected: selectedTimeZone === 'utc' }"
            @click="getTime('utc')"
          >UTC</button>
        </div>
        <div class="station-messages-content">
          <template v-if="notifications && notifications.length">
            <div v-for="(notification, index) in notifications" :key="index" class="message">
              <div v-if="notification.utc" class="day">{{ formatDay(notification.utc) }}</div>
              <div class="message-info">
                <span class="msg-txt">{{ notification.body }}</span>
                <span class="msg-time">{{ notification.formattedTime }}</span>
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
import Day from '@/helpers/Day';

export default {
  props: {
    requestor: Object,
    stationId: Number,
    stationName: String,
  },
  data() {
    return {
      isModalVisible: false,
      notifications: [],
      selectedTimeZone: 'station',
      messagesFetched: false
    };
  },
  methods: {
    openModal() {
      if (!this.messagesFetched) {
        this.fetchMessages();
      } else {
        this.getTime(this.selectedTimeZone);
      }
      this.isModalVisible = true;
    },
    closeDialog() {
      this.isModalVisible = false;
    },
    async fetchMessages() {
      const urlData = { station_id: this.stationId };
      try {
        const response = await this.requestor.makeGetRequest('notifications', urlData);
        if (response.data.status.status_code === 0) {
          this.notifications = this.processNotifications(response.data.user_notifications);
          this.messagesFetched = true;
        } else {
          alert("No messages found for this station.");
        }
      } catch (error) {
        console.log(error);
      }
    },
    getTime(type) {
      this.selectedTimeZone = type;
      this.notifications = this.notifications.map(notification => {
        if (type === 'station') {
          notification.formattedTime = Day.getFormattedTimeWithZone(notification.utc, notification.tz);
        } else if (type === 'browser') {
          notification.formattedTime = Day.getBrowserTimeWithTZ(notification.utc);
        } else if (type === 'utc') {
          notification.formattedTime = Day.getUTCTimeWithTZ(notification.utc);
        }
        return notification;
      });
    },
    formatDay(time) {
      return Day.getFormattedLongDate(time);
    },
    processNotifications(notifications) {
      return notifications.reverse().map(notification => {
        if (notification.utc && notification.tz) {
          notification.formattedTime = Day.getFormattedTimeWithZone(notification.utc, notification.tz);
        }
        return notification;
      });
    },
    getNotificationClass(isOn) {
      return isOn ? 'notification-green' : 'notification-orange';
    },
    getNotificationCountsClass(notification) {
      return notification.fcm_target_success_count === notification.fcm_target_count
        ? 'notification-green'
        : 'notification-orange';
    }
  }
};
</script>
