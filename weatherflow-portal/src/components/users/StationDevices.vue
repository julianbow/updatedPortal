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
          <td v-html="device.id"></td>
          <td
            class="device-status"
            :device-id="device.device_id"
            v-html="getSensorImage(device.statusText)"
            @click.stop="openDeviceStatusModal(device)"
          ></td>
          <td class="device-log" v-html="device.serialLink"></td>
          <td class="device-hardware" v-html="getValue(device.hardware)"></td>
          <td class="device-firmware" v-html="getValue(device.firmware)"></td>
          <td v-html="getValue(device.name)"></td>
          <td v-html="getValue(device.environment)"></td>
          <td v-html="getFixedValue(device.agl, 1)"></td>
          <td class="device-rssi" v-html="device.rssi"></td>
          <td class="device-battery" v-html="getBatteryLink(stationId, device)"></td>
          <td class="device-uptime" v-html="device.uptime"></td>
          <td class="device-last-mqtt" v-html="device.lastMqtt"></td>
          <td class="device-last-ws" v-html="device.lastWs"></td>
        </tr>

        <!-- Action Row - Shown when selectedDeviceId matches -->
        <tr v-show="selectedDeviceId === device.device_id" class="device-action-row">
            <td :colspan="device.device_type === 'AR' ? 13 : 6" class="hub-device-request-calibration">
              <span @click="openDeviceCalibrationModal(device.device_id)">Hub Device Settings </span>
              <span @click="resetDeviceSettings(device.serial, device.device_type, device.device_id)">(Reset)</span>
            </td>
            <td v-if="device.device_type !== 'AR'" colspan="7" class="device-reboot" v-html="device.reboot"></td>
        </tr>
      </tbody>
    </table>

    <!-- HubDeviceSettingsModal -->
    <HubDeviceSettingsModal
      ref="deviceCalibration"
      :requestor="requestor"
    />

    <!-- DeviceStatusModal -->
    <DeviceStatusModal
      :requestor="requestor"
      ref="updateDeviceStatus"
    />
  </div>
</template>

<script>
import DeviceStatusModal from './DeviceStatusModal.vue';
import HubDeviceSettingsModal from './HubDeviceSettingsModal.vue';

export default {
  components: {
    DeviceStatusModal,
    HubDeviceSettingsModal
  },
  props: {
    devices: Array,
    hubSerial: String,
    getDeviceTypeFromSerial: Function,
    stationId: Number,
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
    getValue(value) {
      return value || 'N/A';
    },
    getFixedValue(value, precision) {
      return value ? value.toFixed(precision) : 'N/A';
    },
    getBatteryLink (stationId, device) {
      if (stationId, device) {
        return "<a href='https://tempestwx.com/station/" + stationId + "/graph/" + device.device_id + "/battery/2' target='_blank'>" + device.battery + "</a>";
      } else {
        return device.battery;
      }
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
    },
    async resetDeviceSettings(deviceSerial, deviceType, deviceId) {
      const deleteParams = {
        serial_number: this.hubSerial,
        message: "DELETE_CALIBRATION|" + deviceSerial
      };

      const response = await this.requestor.makeGetRequest("send_message_to_hub/", deleteParams);

      try {
        if (response.data.status_code === 0) {
          console.log("Device settings reset successfully");

          // Await the setTimeout using a promise to wait for 5 seconds
          await new Promise((resolve) => setTimeout(resolve, 5000));
          console.log("5 seconds is up");

          let calibType = "";
          switch (deviceType) {
            case "ST":
              calibType = "STORM_HUB_CALIB";
              break;
            case "AR":
              calibType = "AIR_HUB_CALIB";
              break;
            case "SK":
              calibType = "SKY_HUB_CALIB";
              break;
          }

          const deleteParams2 = {
            device_id: deviceId,
            type: calibType
          };

          // Await the second request
          const response2 = await this.requestor.makeGetRequest("calibration_push_to_hub/", deleteParams2);

          if (response2.data.status_code === 0) {
            alert("Hub Device Settings have been reset.  Calibrations are confirmed on the 10s");
          } else {
            alert("Unable to push calibrations to the hub");
          }
        }
      } catch (error) {
        console.error("Error resetting device settings:", error);
      }
    },
    openDeviceStatusModal(device) {
      this.$refs.updateDeviceStatus.openModal(device);
    },
    openDeviceCalibrationModal(deviceId) {
      this.$refs.deviceCalibration.openModal(deviceId);
    },
  }
};
</script>