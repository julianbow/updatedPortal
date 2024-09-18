<template>
  <div>
    <table class="devices-table">
      <thead>
          <tr>
              <th>ID</th>
              <th>Sensors</th>
              <th>Serial #</th>
              <th title="Device Hardware">Hard</th>
              <th title="Device Firmware">Firm</th>
              <th>Name</th>
              <th title="Environment">Env</th>
              <th title="Above Ground Level (in meters)">AGL</th>
              <th>RSSI</th>
              <th>Batt</th>
              <th>Uptime</th>
              <th>MQTT</th>
              <th title="Last Web Socket Connection">WS</th>
          </tr>
      </thead>
      <tbody v-for="(device, index) in devices" :key="index">
        <!-- Main device row -->
        <tr @click="toggleDevice(device.device_id)" class="device-row">
          <td v-html="device.device_id"></td>
          <td
            class="device-status"
            :device-id="device.device_id"
            v-html="getSensorImage(device.statusText)"
            @click.stop="openDeviceStatusModal(device)"
          ></td>
          <td class="device-log" v-html="device.serial"></td>
          <td class="device-hardware" v-html="getValue(device.hardware)"></td>
          <td class="device-firmware" v-html="getValue(device.firmware)"></td>
          <td v-html="getValue(device.name)"></td>
          <td v-html="getValue(device.environment)"></td>
          <td v-html="getFixedValue(device.agl, 1)"></td>
          <td class="device-rssi" v-html="device.rssi"></td>
          <td class="device-battery" v-html="device.battery"></td>
          <td class="device-uptime" v-html="device.uptime"></td>
          <td class="device-last-mqtt" v-html="device.lastMqtt"></td>
          <td class="device-last-ws" v-html="device.lastWs"></td>
        </tr>

        <!-- Action Row - Shown when selectedDeviceId matches -->
        <tr v-show="selectedDeviceId === device.device_id" class="device-action-row">
            <td colspan="4" class="hub-device-request-calibration">Hub Device Settings (Reset)</td>
            <td v-if="device.device_type !== 'AR'" colspan="4">Download Data</td>
            <td v-else colspan="9">Download Data</td>
            <td v-if="device.device_type !== 'AR'" colspan="5" class="device-reboot" v-html="device.reboot"></td>
        </tr>
      </tbody>
    </table>

    <!-- DeviceStatusModal -->
    <DeviceStatusModal
      :requestor="requestor"
      ref="updateDeviceStatus"
    />
  </div>
</template>

<script>
import DeviceStatusModal from './DeviceStatusModal.vue';

export default {
  components: {
    DeviceStatusModal
  },
  props: {
    devices: Array,
    getDeviceTypeFromSerial: Function,
    requestor: Object
  },
  data() {
    return {
      selectedDeviceId: null,
    };
  },
  methods: {
    toggleDevice(deviceId) {
      this.selectedDeviceId = this.selectedDeviceId === deviceId ? null : deviceId;
    },
    openDeviceStatusModal(device) {
      this.$refs.updateDeviceStatus.openModal(device);
    },
    getValue(value) {
      return value || 'N/A';
    },
    getFixedValue(value, precision) {
      return value ? value.toFixed(precision) : 'N/A';
    },
    getSensorImage(status) {
      const checkmark = "<img class='checkmark' width='30' height='30'/>";
      const xmark = "<img class='xmark' width='30' height='30'/>";
      const warning = "<img class='warning' width='30' height='30'/>";

      var sensorStatusIcon = "";

      if (status === 'warning') {
        sensorStatusIcon = warning;
      } else if (status === 'success') {
        sensorStatusIcon = checkmark;
      } else if ((status === 'failure')) {
        sensorStatusIcon = xmark;
      }

      return sensorStatusIcon;
    }
  }
};
</script>