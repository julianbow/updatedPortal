<template>
    <div class="modal-ctn" v-if="isModalVisible">
      <div class="modal-content">
        <a class="modal-close" @click="closeDialog"></a>
        <h2 class="device-name">{{ device.name }} Sensor Status</h2>
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
import DeviceStatus from '@/helpers/DeviceStatus';

export default {
  props: {
    requestor: Object,
  },
  data() {
    return {
      isModalVisible: false,
      sensorData: [],
      device: null,
      deviceStatus: null,
    };
  },
  methods: {
    openModal(device) {
      this.device = device;
      this.deviceStatus = new DeviceStatus();
      this.populateSensorData();
      this.isModalVisible = true;
    },
    closeDialog() {
      this.isModalVisible = false;
    },
    populateSensorData() {
      const deviceType = this.device.device_type;
      const status = this.device.status;
      const firmwareVersion = this.device.firmware;

      const deviceSensors = this.deviceStatus.sensors[deviceType];
      if (!deviceSensors) {
        console.warn('No sensor info for the selected device type.');
        return;
      }

      this.sensorData = deviceSensors.map((sensorItem) => {
        let sensorStatus = [];
        let boosterArray = [];
        let classNames = [];
        let combinedStatus = 0;

        if (sensorItem.label === "Power Mode") {
          sensorItem.flags.forEach(flag => {
            if (this.deviceStatus._hasSensorError(parseInt(status), flag.flag)) {
              combinedStatus |= flag.flag;
            }
          });

          const batteryStatus = this.deviceStatus.getBatteryStatus(combinedStatus, firmwareVersion);
          if (batteryStatus) {
            sensorStatus.push(batteryStatus);
            if (batteryStatus !== "Performance Mode (M0)" && batteryStatus !== "Normal (M0)" && batteryStatus !== "Normal Mode (M1 + M3)") {
              classNames.push(this.getErrorClass("warning"));
            }
          }
        }

        // Process each flag (error, warning, etc.)
        sensorItem.flags.forEach((flag) => {
          if (this.deviceStatus._hasSensorError(status, flag.flag)) {
            if (sensorItem.label === "Power Booster") {
              boosterArray.push(flag.failedText);
            } else if (sensorItem.label !== "Power Mode") {
              sensorStatus.push(flag.failedText || 'Failed');
              classNames.push(this.getErrorClass(flag.type));
            }
          }
        });

        // Logic for Power Booster
        if (boosterArray.length > 0) {
          const text = this.deviceStatus.getPowerBoosterStatus(boosterArray);
          sensorStatus.push(text || "Failed");
          classNames.push(this.getErrorClass("Normal"));
        }

        const statusDisplay = sensorStatus.length > 0 ? sensorStatus.join(', ') : sensorItem.passedText || 'OK';
        const className = classNames.length > 0 ? classNames.join(' ') : 'cl-apply';

        return {
          label: sensorItem.label,
          statusDisplay,
          className,
        };
      });
    },
    getErrorClass(errorType) {
      switch (errorType) {
      case 'error':
        return 'cl-noapply';
      case 'warning':
        return 'cl-warning';
      default:
        return 'cl-apply';
      }
    },
  },
};
</script>

  <style scoped>
  .device-list td span.cl-apply {
    color: green;
  }

  .device-list td span.cl-noapply {
    color: red;
  }

  .device-list td span.cl-warning {
    color: orange;
  }
  </style>
