<template>
  <div id="user-info">
    <h2>{{ selectedUser.email_address }}</h2>
    <div class="account-info">
      <div>
        <p class="label">User ID:</p>
        <span class="value">{{ selectedUser.user_id }}</span>
      </div>
      <div>
        <p class="label">Created Date:</p>
        <span class="value">{{ formatTimestamp(selectedUser.created_date) }}</span>
      </div>
      <div>
        <p class="value">Last Used:</p>
        <span class="label">{{ formatTimestamp(selectedUser.last_authenticated) }}</span>
      </div>
    </div>

    <div id="stations" v-if="stations.length">
      <h3>Stations</h3>
      <div
        v-for="(station, index) in stations"
        :key="station.location_id"
        class="station"
        :data-loc-id="station.location_id"
      >
        <!-- Station Header -->
        <div class="station-hdr" @click="toggleStation(station.location_id)">
          <div class="station-hdr-left">
            <h3>
              <a v-if="station.location_meta.share_with_wf" :href="'https://tempestwx.com/share/' + station.location_id" target="_blank">{{ station.location_name }}</a>
              <span v-else>{{ station.location_name }}</span>
              <!-- Expandable indicator -->
            </h3>
            <a href="#" :data-station-id="station.location_id">{{ station.location_id }}</a>
          </div>
          <span v-if="index > 0" class="down-arrow" :class="{'up' : expandedStation === station.location_id}"></span>
        </div>

        <div class="station-hdr-2">
          <div class="station-last-modified">
            <p class="label">Modified</p>
            <span class="value" :data-timestamp="station.last_modified" :title="formatTimestamp(station.last_modified)">
              {{ formatTimestamp(station.last_modified) }}
            </span>
          </div>
          <div class="station-created">
            <p class="label">Station Created</p>
            <span class="value">{{ formatTimestamp(station.created) }}</span>
          </div>
        </div>

        <!-- Station Info -->
        <StationDetails
          v-if="expandedStation === station.location_id || index === 0"
          :station="station"
          :coastalExclusions="coastalExclusions"
          :expandedStation="expandedStation"
          :index="index"
        />

      </div>
    </div>
  </div>
</template>

<script>
import StationDetails from './StationDetails.vue';
export default {
  components: {
    StationDetails,
  },
  props: {
    selectedUser: Object,
    stations: Array,
    coastalExclusions: Object,
    formatTimestamp: Function,
  },
  data() {
    return {
      expandedStation: null,
    };
  },
  methods: {
    toggleStation(stationId) {
      this.expandedStation = this.expandedStation === stationId ? null : stationId;
    }
  },
};
</script>
