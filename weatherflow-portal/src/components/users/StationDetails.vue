<template>
    <div v-show="expandedStation === stationDetails.location_id || index === 0" class="station-info">
        <div>
            {{ console.log("Station details: ", stationDetails) }}
        </div>
          <div class="station-info-col-1">
            <div><p class="label">Serial</p><span class="value">{{ stationDetails.hub_serial || 'N/A' }}</span></div>
            <div><p class="label">Device ID</p><span class="value">{{ stationDetails.hub_device_id || 'N/A' }}</span></div>
            <div><p class="label">Frequency</p><span class="value">{{ stationDetails.hub_frequency || 'N/A' }}</span></div>
            <div><p class="label">FW Platform</p><span class="value">{{ stationDetails.hub_hardware_revision || 'N/A' }}</span></div>
            <div><p class="label">Firmware</p><span class="value">{{ stationDetails.hub_firmware_revision || 'N/A' }}</span></div>
            <div><p class="label">EFR32 Firmware</p><span class="value">{{ stationDetails.efr32_firmware || 'N/A' }}</span></div>
            <div><p class="label">RSSI</p><span class="value">{{ stationDetails.hub_rssi || 'N/A' }}</span></div>
            <div><p class="label">State</p><a class="value" :href="'https://tempestwx.com/settings/station/' + stationDetails.location_id + '/status'" target="_blank"></a></div>
            <div><p class="label">Cellular</p><a class="value" :data-id="stationDetails.hub_device_id"></a></div>
          </div>

          <div class="station-info-col-2">
            <div>
              <p class="label">Location</p>
              <span class="value">
                <a :href="'/sw/map/' + stationDetails.location_id">
                  {{ stationDetails.latitude }}, {{ stationDetails.longitude }}
                </a>
                (<a target="_blank" :href="'https://one.weatherflow.com/map#' + stationDetails.public_latitude + ',' + stationDetails.public_longitude + ',18,1'">T1</a>)
              </span>
            </div>
            <div><p class="label">Elevation</p><span class="value">{{ stationDetails.elevation }} m</span></div>
            <div><p class="label">Timezone</p><span class="value">{{ stationDetails.timezone }}</span></div>
            <div>
              <p class="label">Coastal Zone</p>
              <select name="coastal-zone-options" id="coastal-zone-options" class="value" :data-location-id="stationDetails.location_id">
                <option v-for="(text, value) in coastalExclusions" :key="value" :value="value" :selected="stationDetails.coastal_exclusion_flag == value">
                  {{ text }}
                </option>
              </select>
            </div>
            <div><p class="label">Local Only</p><span class="value boolean-display">{{ stationDetails.is_local_mode }}</span></div>
            <div><p class="label">Share WF</p><span class="value boolean-display"></span></div>
            <div class="hub-uptime"><p class="label">Uptime</p><span class="value">{{ stationDetails.hub_uptime || 'N/A' }}</span></div>
            <div class="hub-latest-mqtt-status"><p class="label">Latest MQTT Status</p><span class="value">{{ stationDetails.latest_mqtt_status || 'N/A' }}</span></div>
            <div class="latest-cell-state"><p class="label">Latest Cell Status</p><a class="value" :data-id="stationDetails.location_id">{{ stationDetails.latest_cell_status || 'N/A' }}</a></div>
          </div>
        </div>
</template>

<script>
export default {
  props: {
    stationDetails: Object,
    coastalExclusions: Object,
    expandedStation: Number,
    index: Number,
  },
  mounted() {
    console.log("in station details: ", this.stationDetails);
  }
};
</script>