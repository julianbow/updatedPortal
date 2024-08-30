<template>
    <div v-show="expandedStation === station.location_id || index === 0" class="station-info">
          <div class="station-info-col-1">
            <div><p class="label">Serial</p><span class="value">{{ station.hub_serial || 'N/A' }}</span></div>
            <div><p class="label">Device ID</p><span class="value">{{ station.hub_device_id || 'N/A' }}</span></div>
            <div><p class="label">Frequency</p><span class="value">{{ station.hub_frequency || 'N/A' }}</span></div>
            <div><p class="label">FW Platform</p><span class="value">{{ station.hub_hardware_revision || 'N/A' }}</span></div>
            <div><p class="label">Firmware</p><span class="value">{{ station.hub_firmware_revision || 'N/A' }}</span></div>
            <div><p class="label">EFR32 Firmware</p><span class="value">{{ station.efr32_firmware || 'N/A' }}</span></div>
            <div><p class="label">RSSI</p><span class="value">{{ station.hub_rssi || 'N/A' }}</span></div>
            <div><p class="label">State</p><a class="value" :href="'https://tempestwx.com/settings/station/' + station.location_id + '/status'" target="_blank"></a></div>
            <div><p class="label">Cellular</p><a class="value" :data-id="station.hub_device_id"></a></div>
          </div>

          <div class="station-info-col-2">
            <div>
              <p class="label">Location</p>
              <span class="value">
                <a :href="'/sw/map/' + station.location_id">
                  {{ station.latitude }}, {{ station.longitude }}
                </a>
                (<a target="_blank" :href="'https://one.weatherflow.com/map#' + station.public_latitude + ',' + station.public_longitude + ',18,1'">T1</a>)
              </span>
            </div>
            <div><p class="label">Elevation</p><span class="value">{{ station.elevation }} m</span></div>
            <div><p class="label">Timezone</p><span class="value">{{ station.timezone }}</span></div>
            <div>
              <p class="label">Coastal Zone</p>
              <select name="coastal-zone-options" id="coastal-zone-options" class="value" :data-location-id="station.location_id">
                <option v-for="(text, value) in coastalExclusions" :key="value" :value="value" :selected="station.coastal_exclusion_flag == value">
                  {{ text }}
                </option>
              </select>
            </div>
            <div><p class="label">Local Only</p><span class="value boolean-display">{{ station.is_local_mode }}</span></div>
            <div><p class="label">Share WF</p><span class="value boolean-display">{{ station.location_meta.share_with_wf }}</span></div>
            <div class="hub-uptime"><p class="label">Uptime</p><span class="value">{{ station.hub_uptime || 'N/A' }}</span></div>
            <div class="hub-latest-mqtt-status"><p class="label">Latest MQTT Status</p><span class="value">{{ station.latest_mqtt_status || 'N/A' }}</span></div>
            <div class="latest-cell-state"><p class="label">Latest Cell Status</p><a class="value" :data-id="station.location_id">{{ station.latest_cell_status || 'N/A' }}</a></div>
          </div>
        </div>
</template>

<script>
export default {
  props: {
    station: Object,
    coastalExclusions: Object,
    expandedStation: Number,
    index: Number,
  }
};
</script>