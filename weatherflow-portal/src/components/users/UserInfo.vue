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
            <a href="#" :data-station-id="station.station_id">{{ station.station_id }}</a>
          </div>
          <span v-if="index > 0" class="down-arrow" :class="{'up' : isStationExpanded(station.station_id)}"></span>
        </div>

        <!-- Station Details -->
        <StationDetails
          v-if="isStationExpanded(station.station_id) && stationDetailsMap[station.station_id]"
          :stationDetails="stationDetailsMap[station.station_id]"
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
      expandedStations: [], // Store expanded stations by ID
      stationDetailsMap: {}, // Store details for each station by ID
    };
  },
  watch: {
    stations() {
      if (this.stations.length > 0) {
        this.expandFirstStation();
      }
    }
  },
  methods: {
    expandFirstStation() {
      const firstStation = this.stations[0].station_id;
      if (firstStation && !this.isStationExpanded(firstStation)) {
        this.toggleStation(firstStation); // Ensure the first station is always expanded
      }
    },
    toggleStation(stationId) {
      const index = this.expandedStations.indexOf(stationId);
      if (index !== -1) {
        this.expandedStations.splice(index, 1); // Collapse station if already expanded
      } else {
        this.expandedStations.push(stationId); // Expand station if not expanded

        // Fetch station details if not already fetched
        if (!this.stationDetailsMap[stationId]) {
          this.fetchUserStations(stationId);
        }
      }
    },
    isStationExpanded(stationId) {
      return this.expandedStations.includes(stationId);
    },
    async fetchUserStations(stationId) {
      try {
        const response = await this.requestor.makeGetRequest(`stations/${stationId}`);
        this.stationDetailsMap[stationId] = response.data; // Cache the station details by ID
        console.log('Fetched station details:', this.stationDetailsMap[stationId]);
      } catch (error) {
        console.error('Error fetching station details:', error);
      }
    },
  },
  mounted() {
    this.requestor = new Requestor();
  },
};
</script>


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