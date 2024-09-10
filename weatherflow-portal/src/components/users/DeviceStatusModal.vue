<template>
    <div class="modal-ctn" v-if="isModalVisible">
      <div class="modal-content">
        <a class="modal-close" @click="closeDialog"></a>
        <h2 class="device-name">Sensor Status</h2>
        <div class="device-status-content">
          <table class="current-sensors">
            <thead>
              <tr>
                <th>Sensor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(sensor, index) in sensorData" :key="index" class="device-list">
                <td>{{ sensor.label }}</td>
                <td>
                  <span :class="sensor.className">{{ sensor.statusDisplay }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>

<script>
// import Requestor from '@/helpers/Requestor'; // Assuming Requestor is available in your project
import '../../assets/css/modal.css';

export default {

  data() {
    return {
      isModalVisible: false,
      sensorData: [],
      sensors: {
        AR: [
          { label: "Temperature", flags: [{ flag: 0x00000010, type: "error" }] },
          { label: "RH", flags: [{ flag: 0x00000020, type: "error" }] },
          {
            label: "Lightning",
            flags: [
              { flag: 0x00000001, type: "error" },
              { flag: 0x00000004, failedText: "Disturber", type: "warning" },
              { flag: 0x00000002, failedText: "Noise", type: "warning" },
            ],
          },
        ],
        // Add SK, ST, and other device types here...
      },
    };
  },
  methods: {
    openModal() {
      this.populateSensorData();
      this.isModalVisible = true;
    },
    closeDialog() {
      this.isModalVisible = false;
    },
    populateSensorData() {
      const deviceSensors = this.sensors[this.deviceType];
      if (!deviceSensors) {
        // alert("No sensor info for the selected device type.");
        return;
      }
      this.sensorData = deviceSensors.map(sensorItem => {
        let sensorStatus = [];
        let classNames = [];

        sensorItem.flags.forEach(flag => {
          if (this.hasSensorError(this.status, flag.flag)) {
            sensorStatus.push(flag.failedText || "Failed");
            classNames.push(this.getErrorClass(flag.type));
          }
        });

        const statusDisplay = sensorStatus.length > 0 ? sensorStatus.join(",") : "OK";
        const className = classNames.length > 0 ? classNames.join(" ") : "cl-apply";

        return { label: sensorItem.label, statusDisplay, className };
      });
    },
    hasSensorError(sensorStatus, sensorFlag) {
      return (sensorStatus & sensorFlag) !== 0;
    },
    getErrorClass(errorType) {
      switch (errorType) {
      case "error":
        return "cl-noapply";
      case "warning":
        return "cl-warning";
      default:
        return "cl-apply";
      }
    },
  },
};
</script>