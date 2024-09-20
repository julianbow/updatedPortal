<template>
    <div v-if="isModalVisible" class="modal-ctn">
      <div class="modal-content">
        <a class="modal-close" @click="hideModal"></a>
        <div class="list-hdr">{{ currentCalibration.serial_number }}</div>
        <div class="hub-device-calibration-content">
            <div id="hub-device-calibration-confirmation" :class="{ confirmed: confirmed, unconfirmed: !confirmed }">
            <span></span>
            <p>{{ confirmed ? "Settings confirmed" : "Settings unconfirmed" }}</p>
        </div>

        <div id="hub-reported">
            <span>Hub Reported: {{ hubReported ? hubReported : "N/A" }}</span>
        </div>
          <table id="hub-device-calibration" class="devices-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Set To</th>
                <th>Hub Reporting</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in calibrationRows" :key="index">
                <td>{{ row.title }}</td>
                <td>{{ row.setValue }}</td>
                <td>{{ row.hubValue }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>

  <script>
  import Day from '@/helpers/Day';
  export default {
    props: {
      requestor: Object,
    },
    data() {
      return {
        isModalVisible: false,
        calibrationKeys: {
          air_pressure_offset: { title: "Air Pressure Offset" },
          air_pressure_scale: { title: "Air Pressure Scale" },
          air_rh_offset: { title: "Relative Humidity Offset" },
          air_rh_scale: { title: "Relative Hummidity Scale" },
          air_suppress_lightning: { title: "Lightning Disabled", display: "boolean" },
          air_temp_offset: { title: "Temperature Offset" },
          air_temp_scale: { title: "Temperature Scale" },
          debug_state: { title: "Debugging", display: "boolean" },
          device_id: { title: "Device Id" },
          hub_serial_number: { title: "Hub Serial Number" },
          power_saving_mode: { title: "Power Save Mode", display: "boolean" },
          serial_number: { title: "Serial Number" },
          sky_direction_offset: { title: "Direction Offset" },
          sky_lux_scale: { title: "Lux Scale" },
          sky_rain_scale: { title: "Rain Scale A" },
          sky_rain_scale_b: { title: "Rain Scale B" },
          sky_gust_lull_factor: { title: "Gust/Lull Factor" },
          sky_solar_radiation_scale: { title: "Solar Radiation Scale" },
          sky_uv_scale: { title: "UV Scale" },
          sky_wind_scale: { title: "Wind Scale" },
          hub_firmware_revision: { title: "Hub Firmware" }
        },
        currentCalibration: {},
        calibrationRows: [],
        confirmed: false,
        hubReported: null
      };
    },
    methods: {
    openModal(deviceId) {
        this.isModalVisible = true;
        this.requestCalibration(deviceId);
    },
    hideModal() {
        this.isModalVisible = false;
    },
    async requestCalibration(deviceId) {
        const response = await this.requestor.makeGetRequest(`calibration/${deviceId}`);

        try {
            if (response.data.status.status_code === 0) {
                const calibration = response.data.calibration;
                const lastReported = response.data.latest_calibration_message_from_hub.timestamp_received;
                const hubCalibration = this.getHubCalibrationKeys(response.data);

                if (calibration.confirmed === 1) {
                    this.confirmed = true;
                }

                if (lastReported) {
                    this.hubReported = Day.getUTCTimeDateWithTZ(lastReported);
                }

                // Prepare the calibration rows
                this.calibrationRows = Object.keys(this.calibrationKeys).map((key) => {
                    const calibrationValue = calibration[key] !== null && calibration[key] !== undefined ? calibration[key] : "---";
                    const hubValue = this.getHubCalibrationValueForKey(hubCalibration, key) !== null && this.getHubCalibrationValueForKey(hubCalibration, key) !== undefined
                        ? this.getHubCalibrationValueForKey(hubCalibration, key)
                        : "---";

                    const title = this.calibrationKeys[key]?.title || key;

                    // Handle boolean display values
                    const isBoolean = this.calibrationKeys[key]?.display === "boolean";
                    const displayValue = isBoolean ? (calibrationValue === 1 ? "Yes" : "No") : calibrationValue;
                    const displayHubValue = isBoolean ? (hubValue === 1 ? "Yes" : "No") : hubValue;

                    return {
                        title,
                        setValue: displayValue,
                        hubValue: displayHubValue,
                    };
                });

                this.currentCalibration = calibration;
            }
        } catch (error) {
            console.error('Error fetching calibration data:', error);
        }
    },
    getHubCalibrationKeys(data) {
        return data?.latest_calibration_message_from_hub || null;
    },
    getHubCalibrationValueForKey(hubCalibrationKeys, key) {
        return hubCalibrationKeys && hubCalibrationKeys[key] !== null && hubCalibrationKeys[key] !== undefined
        ? hubCalibrationKeys[key]
        : null;
    }
    }
  };
  </script>