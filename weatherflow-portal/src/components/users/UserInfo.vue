<template>
  <div id="user-info">
    <div class="user-email">
      <h2>{{ selectedUser.email_address }}</h2>
      <span id="edit-email" @click="showEmailModal"></span>
    </div>
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
        <div class="station-hdr" @click="index > 0 && toggleStation(station.station_id)">
          <div class="station-hdr-left">
            <span class="station-messages" @click="showStationMessages(index, station.station_id, station.name)"></span>
            <h3>{{ station.name }}</h3>
            <a href="#" :data-station-id="station.station_id">{{ station.station_id }}</a>
          </div>
          <span v-if="index > 0" class="down-arrow" :class="{'up' : isStationExpanded(station.station_id)}"></span>
        </div>

        <!-- Station Details -->
        <StationDetails
          v-if="stationDetailsMap[station.station_id]"
          v-show="isStationExpanded(station.station_id)"
          :stationDetails="stationDetailsMap[station.station_id].stations[0]"
          :formatTimestamp="formatTimestamp"
          :requestor="requestor"
          :index="index"
        />
        <StationMessages
          :requestor="requestor"
          :stationId="station.station_id"
          :stationName="station.name"
          :formatTimestamp="formatTimestamp"
          ref="stationMessages"
        />
      </div>
      <!-- Arbitrary Locations -->
      <ArbitraryLocations v-if="arbitraryLocations.length" :arbitraryLocations="arbitraryLocations" />
      <!-- Access Tokens -->
      <AccessTokens v-if="accessTokens.length" :accessTokens="accessTokens" />
    </div>

    <UpdateEmailModal
      :email="selectedUser.email_address"
      :requestor="requestor"
      :userId="selectedUser.user_id"
      ref="updateEmailModal"
    />
  </div>
</template>

<script>
import UpdateEmailModal from './UpdateEmailModal.vue';
import StationMessages from './StationMessages.vue';
import StationDetails from './StationDetails.vue';
import ArbitraryLocations from './ArbitraryLocations.vue';
import AccessTokens from './AccessTokens.vue';
import Requestor from '../../helpers/Requestor';

export default {
  components: {
    UpdateEmailModal,
    StationMessages,
    StationDetails,
    ArbitraryLocations,
    AccessTokens
  },
  props: {
    selectedUser: Object,
    stations: Array,
    formatTimestamp: Function,
  },
  data() {
    return {
      expandedStations: [],
      stationDetailsMap: {},
      arbitraryLocations: [],
      accessTokens: [],
      requestor: null,
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
        this.toggleStation(firstStation);
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
          this.fetchStationDetails(stationId);
          this.fetchAccessTokens(this.selectedUser.user_id);
          this.fetchArbitraryLocations(this.selectedUser.user_id);
        }
      }
    },
    isStationExpanded(stationId) {
      return this.expandedStations.includes(stationId);
    },
    async fetchStationDetails(stationId) {
      try {
        const response = await this.requestor.makeGetRequestDev(`stations/${stationId}`, {}, true);
        console.log('Station details:', response.data);
        this.stationDetailsMap[stationId] = response.data;
      } catch (error) {
        console.error('Error fetching station details:', error);
      }
    },
    async fetchArbitraryLocations(userId) {
      try {
        const response = await this.requestor.makeGetRequest("locations_stats", { user_id: userId });

        if (response.data.status.status_code === 0) {
          if (response.data.arbitrary_locations.length > 0) {
            this.arbitraryLocations = response.data.arbitrary_locations;
          }
        }
      } catch (error) {
        console.error("Error fetching arbitrary locations", error);
      }
    },
    async fetchAccessTokens(userId) {
      try {
        const urlData = {
          report_name: "get_user_access_tokens",
          user_id: userId,
        };

        const response = await this.requestor.makePostRequest("report", urlData);

        if (response.data.length > 0) {
          this.accessTokens = response.data;
        }
      } catch (error) {
        console.error("Error fetching access tokens", error);
      }
    },
    showEmailModal() {
      this.$refs.updateEmailModal.openModal();
    },
    showStationMessages(index, stationId, stationName) {
      // Use the correct instance of StationMessages by index
      this.$refs.stationMessages[index].openModal(stationId, stationName);
    },
  },
  mounted() {
    this.requestor = new Requestor();
  },
};
</script>
