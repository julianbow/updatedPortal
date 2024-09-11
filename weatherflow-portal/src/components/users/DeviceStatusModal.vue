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
  .modal-ctn {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal-content {
    background: #fff;
    padding: 40px;
    border-radius: 15px;
    width: 100%;
    max-width: 600px;
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.2);
    position: relative;
  }

  .modal-close {
    position: absolute;
    top: 15px;
    right: 15px;
    background-color: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #333;
  }

  .device-status-content {
    margin-top: 20px;
  }

  .current-sensors {
    width: 100%;
    border-collapse: collapse;
  }

  .current-sensors th,
  .current-sensors td {
    padding: 10px;
    text-align: left;
  }

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
