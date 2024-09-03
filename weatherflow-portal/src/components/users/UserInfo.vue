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
        :key="station.station_id"
        class="station"
        :data-loc-id="station.station_id"
      >
        <!-- Station Header -->
        <div class="station-hdr" @click="toggleStation(station.station_id)">
          <div class="station-hdr-left">
            <h3>
              <span>{{ station.name }}</span>
            </h3>
            <a href="#" :data-station-id="station.station_id">{{ station.station_id }}</a>
          </div>
          <span v-if="index > 0" class="down-arrow" :class="{'up' : expandedStation === station.station_id}"></span>
        </div>

        <!-- <div class="station-hdr-2">
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
        </div> -->

        <!-- Station Details -->
        <StationDetails
          v-if="expandedStation === station.station_id && stationDetailsMap[station.station_id] !== undefined"
          :stationDetails="stationDetailsMap[station.station_id].stations[0]"
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
import Requestor from '../../helpers/Requestor';
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
      stationDetailsMap: {},
    };
  },
  watch: {
    stations() {
      if (this.stations.length > 0) {
        this.toggleStation(this.stations[0].station_id);
      }
    }
  },
  methods: {
    async toggleStation(stationId) {
      this.expandedStation = this.expandedStation === stationId ? null : stationId;

      // If station details are already fetched, do not fetch again
      if (this.expandedStation !== null && !this.stationDetailsMap[stationId]) {
        await this.fetchUserStations(stationId);
      }
    },
    async fetchUserStations(stationId) {
      try {
        const response = await this.requestor.makeGetRequest(`stations/${stationId}`);
        this.stationDetailsMap[stationId] = response.data; // Directly assign the data to the map
        console.log('Fetched station details:', this.stationDetailsMap[stationId].stations[0]);
      } catch (error) {
        console.error('Error fetching user stations:', error);
      }
    }
  },
  mounted() {
    this.requestor = new Requestor();
  },
};
</script>
