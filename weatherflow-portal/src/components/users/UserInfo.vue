<template>
  <div id="user-info">
    <div class="user-email">
      <h2>{{ selectedUser.email_address }}</h2>
      <span id="edit-email" @click="showEmailModal"></span>
    </div>
    <div class="account-info">
      <div>
        <p class="label">User ID:</p>
        <div class="user-id">
            <a target="_blank"
              :href="`https://devp.weatherflow.com/swd/rest/stations_audit?&include_all_records=true&user_id_filter=${selectedUser.user_id}&api_key=791da36a-bf09-4025-970b-a9158378ec59`"
              class="value"
            >
            {{ selectedUser.user_id }}
          </a>
          <span
            class="copy"
            @click="copyToClipboard(selectedUser.user_id)"
            @mouseover="showTooltip = false"
          >
            Copy
          </span>
          <span v-show="showTooltip" class="tooltip">Copied!</span>
        </div>
      </div>
      <div>
        <p class="label">Created Date:</p>
        <span class="value">{{ formatTimestamp(selectedUser.created_date) }}</span>
      </div>
      <div>
        <p class="value">Last Used:</p>
        <span class="label">{{ formatTimestamp(selectedUser.last_authenticated) }}</span>
      </div>
      <span class="user-settings" @click="openUserSettings"></span>
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
            <span class="station-messages" @click.stop="showStationMessages(index, station.station_id, station.name)"></span>
            <h3>{{ station.name }}</h3>
            <a target="_blank" :href="`https://tempestwx.com/station/${station.station_id}`" :data-station-id="station.station_id">{{ station.station_id }}</a>
          </div>
          <span class="down-arrow" :class="{'up' : isStationExpanded(station.station_id)}"></span>
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
          ref="stationMessages"
        />
      </div>
      <!-- Arbitrary Locations -->
      <ArbitraryLocations :requestor="requestor" :userId="selectedUser.user_id" />
      <!-- Access Tokens -->
      <AccessTokens :requestor="requestor" :userId="selectedUser.user_id" />
      <!-- Client IDs -->
      <ClientIds :requestor="requestor" :userId="selectedUser.user_id" />
    </div>

    <UpdateEmailModal
      :email="selectedUser.email_address"
      :requestor="requestor"
      :userId="selectedUser.user_id"
      ref="updateEmailModal"
    />

    <UserSettings
      :userId="selectedUser.user_id"
      :requestor="requestor"
      ref="userSettings"
    />
  </div>
</template>

<script>
import StationMessages from './StationMessages.vue';
import StationDetails from './StationDetails.vue';
import ArbitraryLocations from './ArbitraryLocations.vue';
import AccessTokens from './AccessTokens.vue';
import ClientIds from './ClientIds.vue';
import UpdateEmailModal from './UpdateEmailModal.vue';
import UserSettings from './UserSettings.vue';
import Requestor from '../../helpers/Requestor';

export default {
  components: {
    StationMessages,
    StationDetails,
    ArbitraryLocations,
    AccessTokens,
    ClientIds,
    UpdateEmailModal,
    UserSettings
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
      clientIds: [],
      accessTokens: [],
      showTooltip: false,
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
        this.expandedStations.splice(index, 1);
      } else {
        this.expandedStations.push(stationId);

        if (!this.stationDetailsMap[stationId]) {
          this.fetchStationDetails(stationId);
        }
      }
    },
    copyToClipboard(userId) {
      navigator.clipboard.writeText(userId).then(() => {
        this.showTooltip = true;
        setTimeout(() => {
          this.showTooltip = false;
        }, 1500);
      }).catch(err => {
        console.error('Error copying to clipboard', err);
      });
    },
    isStationExpanded(stationId) {
      return this.expandedStations.includes(stationId);
    },
    async fetchStationDetails(stationId) {
      try {
        const response = await this.requestor.makeGetRequestDev(`stations/${stationId}`, {}, true);
        this.stationDetailsMap[stationId] = response.data;
      } catch (error) {
        console.error('Error fetching station details:', error);
      }
    },
    showEmailModal() {
      this.$refs.updateEmailModal.openModal();
    },
    showStationMessages(index, stationId, stationName) {
      this.$refs.stationMessages[index].openModal(stationId, stationName);
    },
    openUserSettings() {
      this.$refs.userSettings.openModal();
    }
  },
  mounted() {
    this.requestor = new Requestor();
    this.expandFirstStation()
  },
};
</script>
