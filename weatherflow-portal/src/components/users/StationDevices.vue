<template>
    <table>
    <thead>
        <tr>
            <th></th>
            <th>ID</th>
            <th>Sensors</th>
            <th>Serial #</th>
            <th>Hard</th>
            <th>Firm</th>
            <th>Name</th>
            <th>Env</th>
            <th>AGL</th>
            <th>RSSI</th>
            <th>Batt</th>
            <th>MQTT</th>
            <th>WS</th>
        </tr>
    </thead>
      <tbody v-for="(device, index) in devices" :key="index">
        <!-- Main device row -->
        <tr @click="toggleDevice(device.device_id)">
          <td><a href="#" title="Device Actions" :data-device-id="device.device_id"></a></td>
          <td v-html="device.device_id"></td>
          <td class="device-status" :device-id="device.device_id" :data-device-type="getDeviceTypeFromSerial(device.serial)" :data-device-fw="getValue(device.firmware)"></td>
          <td class="device-log" v-html="device.serial"></td>
          <td class="device-hardware" v-html="getValue(device.hardware)"></td>
          <td class="device-firmware" v-html="getValue(device.firmware)"></td>
          <td v-html="getValue(device.name)"></td>
          <td v-html="getValue(device.environment)"></td>
          <td v-html="getFixedValue(device.agl, 1)"></td>
          <td class="device-rssi" v-html="device.rssi"></td>
          <td class="device-battery" v-html="device.battery"></td>
          <td class="device-last-mqtt" v-html="device.lastMqtt"></td>
          <td class="device-last-ws" v-html="device.lastWs"></td>
        </tr>

        <!-- Action Row - Shown when selectedDeviceId matches -->
        <tr v-show="selectedDeviceId === device.device_id" class="device-action-row">
          <td colspan="15" class="device-more-row">
            <ul class="device-more-menu">
              <li class="hub-device-request-calibration" v-html="device.calibration"></li>
              <li class="event-log-device" v-html="device.device_id"></li>
              <li class="device-data-download">Download Data (dummy)</li>
              <li v-if="device.device_type !== 'AR'" class="device-reboot" v-html="device.reboot"></li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
</template>

<script>
export default {
  props: {
    devices: Array, // Array of devices
    getDeviceTypeFromSerial: Function,
  },
  data() {
    return {
      selectedDeviceId: null
    };
  },
  methods: {
    toggleDevice(deviceId) {
      this.selectedDeviceId = this.selectedDeviceId === deviceId ? null : deviceId;
    },
    getValue(value) {
      return value || 'N/A'; // Simple method for safely getting a value
    },
    getFixedValue(value, precision) {
      return value ? value.toFixed(precision) : 'N/A'; // Helper for formatted numbers
    },
  }
};
</script>