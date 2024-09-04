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

      <!-- Devices section -->
      <div v-if="deviceLinks.length > 0" class="devices">
        <div class="hub-device-hdr">Devices</div>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>Serial #</th>
              <th>Calibration</th>
              <th>Reboot</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(device, index) in deviceLinks" :key="index">
              <td><a href="#" title="Device Actions" :data-device-id="device.id"></a></td>
              <td v-html="device.id"></td>
              <td v-html="device.serial"></td>
              <td v-html="device.calibration"></td>
              <td v-html="device.reboot"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>


<script>
import Diagnostics from '@/helpers/Diagnostics';
import DataDisplay from '@/helpers/DataDisplay';

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
      deviceLinks: [],
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
    initializeDiagnostics() {
      this.diagnostics = new Diagnostics({
        locationId: this.stationDetails.location_id,
        ready: () => {
          this.updateDiagnosticsData();
          this.updateDeviceData();
        },
      });
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
    updateDeviceData() {
      // Filter out devices with a device_type of "HB"
      const filteredDevices = this.stationDetails.devices.filter(device => device.device_type !== "HB");

      // Map over the filtered devices to create deviceLinks
      this.deviceLinks = filteredDevices.map(device => {
        return {
          id: DataDisplay.getDeviceIdWithLink(device.device_id),
          serial: DataDisplay.getSerialWithLogLink(device.serial_number),
          calibration: DataDisplay.getCalibrationRequestLink(this.stationHub.serial_number, device.serial_number),
          reboot: DataDisplay.getDeviceRebootLink(this.stationHub.serial_number, device.serial_number),
        };
      });
    },

  },
  mounted() {
    this.initializeDiagnostics();
  }
};
</script>
