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
        <div class="devices-hdr">Devices</div>
        <!-- Pass the devices array to the DeviceRow component -->
        <StationDevices
            :devices="deviceLinks"
            :getDeviceTypeFromSerial="getDeviceTypeFromSerial"
        />
        </div>
  </div>
  </template>

<script>
import Diagnostics from '@/helpers/Diagnostics';
import DataDisplay from '@/helpers/DataDisplay';
import DeviceStatus from '@/helpers/DeviceStatus';
import StationDevices from './StationDevices.vue';
import Day from '@/helpers/Day';

export default {
  components: {
    StationDevices
  },
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
      devices: null,
      deviceLinks: [],
      selectedDeviceId: null
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
      this.lastMqttStatus = Day.getFuzzyTimestampWithEpoch(this.diagnostics.getLastMQTTStatus());
      this.latestCellStatus = this.diagnostics.getCellularTimestamp();
      this.devices = this.diagnostics.getDevices();
    },
    updateDeviceData() {
      const filteredDevices = this.stationDetails.devices.filter(device => device.device_type !== "HB");
      const filteredDeviceInfo = this.devices.filter(device => device.device_type !== "HB");

      this.deviceLinks = filteredDevices.map(device => {
        const matchingDeviceInfo = filteredDeviceInfo.find(infoDevice => infoDevice.device_id === device.device_id);
        console.log(matchingDeviceInfo);

        return {
          id: DataDisplay.getDeviceIdWithLink(device.device_id),
          device_id: device.device_id,
          serial: DataDisplay.getSerialWithLogLink(device.serial_number),
          calibration: DataDisplay.getCalibrationRequestLink(this.stationHub.serial_number, device.serial_number),
          reboot: DataDisplay.getDeviceRebootLink(this.stationHub.serial_number, device.serial_number),
          firmware: device.firmware_revision,
          hardware: device.hardware_revision,
          name: device.device_meta?.name || 'N/A',
          environment: device.device_meta?.environment || 'N/A',
          agl: device.device_meta?.agl || 0,
          device_type: device.device_type,
          status: this.deviceStatus.findStatus(matchingDeviceInfo?.sensor_status, device.device_type),
          rssi: matchingDeviceInfo?.rssi || 'N/A',
          battery: matchingDeviceInfo?.voltage || 'N/A',
          lastMqtt: Day.getFuzzyTimestampWithEpoch(matchingDeviceInfo?.last_mqtt_ob_epoch) || 'N/A',
          lastWs: Day.getFuzzyTimestampWithEpoch(matchingDeviceInfo?.last_ob_epoch) || 'N/A'
        };
      });
      console.log(this.deviceLinks);
    },
    getDeviceTypeFromSerial(serial) {
      return DataDisplay.getDeviceTypeFromSerial(serial);
    }
  },
  mounted() {
    this.initializeDiagnostics();
    this.deviceStatus = new DeviceStatus();
  }
};
</script>
