<template>
    <div>
        <div class="station-hdr-2">
            <div class="station-last-modified">
                <p class="label">Modified</p>
                <span class="value" :data-timestamp="stationDetails.last_modified" :title="formatTimestamp(stationDetails.last_modified)">
                    {{ formatTimestamp(stationDetails.last_modified) }}
                </span>
            </div>
            <div class="station-created">
                <p class="label">Station Created</p>
                <span class="value">{{ formatTimestamp(stationDetails.created) }}</span>
            </div>
        </div>
        <div class="hub-info">
            <div class="station-info-col-1">
                <!-- Hub section -->
                <div><p class="label">Serial</p><span class="value">{{ stationHub.serial_number || 'N/A' }}</span></div>
                <div><p class="label">Device ID</p><span class="value">{{ stationHub.device_id || 'N/A' }}</span></div>
                <div><p class="label">Frequency</p><span class="value">{{ hubFrequency || 'N/A' }}</span></div>
                <div><p class="label">FW Platform</p><span class="value">{{ stationHub.hardware_revision || 'N/A' }}</span></div>
                <div><p class="label">Firmware</p><span class="value">{{ stationHub.firmware_revision || 'N/A' }}</span></div>
                <div><p class="label">EFR32 Firmware</p><span class="value">{{ efr32Firmware || 'N/A' }}</span></div>
            </div>

            <div class="station-info-col-2">
                <div><p class="label">RSSI</p><span class="value">{{ hubRssi || 'N/A' }}</span></div>
                <div><p class="label">State</p><span class="value">{{ hubState || 'N/A' }}</span></div>
                <div><p class="label">Cellular</p><span class="value">{{ cellularStatus || 'N/A' }}</span></div>
                <div class="hub-uptime"><p class="label">Uptime</p><span class="value">{{ hubUptime || 'N/A' }}</span></div>
                <div class="hub-latest-mqtt-status"><p class="label">Latest MQTT Status</p><span class="value">{{ lastMqttStatus || 'N/A' }}</span></div>
                <div class="latest-cell-state"><p class="label">Latest Cell Status</p><span class="value">{{ latestCellStatus || 'N/A' }}</span></div>
            </div>
        </div>
    </div>
</template>

<script>
import Diagnostics from '@/helpers/Diagnostics';

export default {
  props: {
    stationDetails: Object,
    formatTimestamp: Function,
    index: Number,
  },
  data() {
    return {
      diagnostics: null,
      hub: {},
      hubFrequency: null,
      efr32Firmware: null,
      hubRssi: null,
      hubState: null,
      cellularStatus: null,
      hubUptime: null,
      lastMqttStatus: null,
      latestCellStatus: null,
    };
  },
  computed: {
    stationHub() {
      return this.getHubForStation(this.stationDetails.devices);
    }
  },
  methods: {
    getHubForStation(devices) {
      let hub = null;
      if (devices) {
        for (let x = 0; x < devices.length; x++) {
          if (devices[x].device_type === "HB") {
            hub = devices[x];
            break;
          }
        }
      }
      return hub;
    },
    updateDiagnosticsData() {
      this.hubFrequency = this.diagnostics.freq();
      this.efr32Firmware = this.diagnostics.efr32Firmware();
      this.hubRssi = this.diagnostics.rssi();
      this.hubState = this.diagnostics.state();
      this.cellularStatus = this.diagnostics.getCellularStatus();
      this.hubUptime = this.diagnostics.getHubUptime();
      this.lastMqttStatus = this.diagnostics.getLastMQTTStatus();
      this.latestCellStatus = this.diagnostics.getCellularTimestamp();
    },
    initializeDiagnostics() {
      this.diagnostics = new Diagnostics({
        locationId: this.stationDetails.location_id,
        ready: () => {
          this.updateDiagnosticsData();
        },
      });
    }
  },
  mounted() {
    this.initializeDiagnostics();
  }
};
</script>
