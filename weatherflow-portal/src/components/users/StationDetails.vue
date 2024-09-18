<template>
    <div>
      <div class="station-hdr-2" :class="{'t1': isTempestOne}">
        <div class="station-modified">
            <span :class="{'type-tempest': !isTempestOne, 'type-tempestOne': isTempestOne}"></span>
          <div class="station-created">
            <p class="label">Station Created</p>
            <span class="value">{{ formatTimestamp(stationDetails.created) }}</span>
          </div>
          <div class="station-last-modified">
            <p class="label">Modified</p>
            <span class="value" :data-timestamp="stationDetails.last_modified" :title="formatTimestamp(stationDetails.last_modified)">
              {{ formatTimestamp(stationDetails.last_modified) }}
            </span>
          </div>
        </div>
        <div class="station-helpers">
          <a title="Continuous Learning">CL</a>
          <a title="Artificial Information Station">AIS</a>
          <a title="Meta Data">MD</a>
          <a target="_blank" title="Better Forecast Portal" :href="generateBFLink">BF</a>
        </div>
      </div>

      <div class="hub-info">
        <div class="station-info-col-1">
          <div><p class="label">Serial</p><span class="value">{{ stationHub.serial_number || 'N/A' }}</span></div>
          <div><p class="label" title="Radio Frequency">Frequency</p><span class="value">{{ hubFrequency || 'N/A' }}</span></div>
          <div>
            <p class="label"
              title="Type of CPU with the version number of the hardware from the point of view of the firmware.">
              Module
            </p>
            <span class="value">{{ getModuleInformation(stationHub.hardware_revision) }}</span>
          </div>
          <div>
            <p class="label"
              title="Firmware version of wifi radio in the hub. Firmware with Module 2 starts at 300 and goes up from there.">
              Firmware
            </p>
            <span class="value">{{ stationHub.firmware_revision || 'N/A' }}</span>
          </div>
          <div>
            <p class="label"
              title="Firmware version of sub ghz radio. Versions < 20 aren't fully compatible with Tempest. Modules 0/1 don't support upgrades, but Module 2 integrates and updates EFR32 firmware with the main HUB.">
                EFR32 Firmware
              </p>
            <span class="value">{{ efr32Firmware || 'N/A' }}</span>
          </div>
            <div><p class="label" title="Type of Hub">Hardware Type</p><span class="value" @click="showHardwareImage" style="cursor: pointer; text-decoration: underline;">{{ getHubIdentifier(hubHardware.hardware_type) }}</span></div>
            <div>
            <p class="label" title="Is hub allowed to be set up on a different user account?">Device Locked</p>
            <span class="value" :class="{'lock': hubHardware.device_locked, 'unlock': !hubHardware.device_locked}">
              {{ hubHardware.device_locked ? 'Locked' : 'Unlocked' }}
            </span>
            </div>
        </div>
        <div class="station-info-col-2">
          <div><p class="label">State</p>
            <div class="state">
              <span class="hub-state" :class="{ 'online': hubState === 'online', 'offline': hubState !== 'online' }"></span>
              <a
              target="_blank"
              :href="`https://tempestwx.com/settings/station/${stationDetails.station_id}/status`"
              class="value">
              {{ hubState || 'N/A' }}</a>
            </div>

            </div>
          <div><p class="label">Device ID</p><span class="value">{{ stationHub.device_id || 'N/A' }}</span></div>
          <div><p class="label">Wi-Fi Signal Strength</p><span class="value">{{ hubRssi || 'N/A' }}</span></div>
          <!-- <div><p class="label">Cellular</p><span class="value">{{ cellularStatus || 'N/A' }}</span></div>
          <div><p class="label">Wifi</p><span class="value">{{ hubHardware.wifi || 'N/A' }}</span></div>
          <div><p class="label">Ethernet</p><span class="value">{{ hubHardware.ethernet }}</span></div> -->
          <div><p class="label" title="What the hub is connected to.">Connectivity</p><span class="value">{{ hubHardware.connectivity }}</span></div>
          <div class="hub-uptime"><p class="label" title="Duration the device has had continuous power">Uptime</p><span class="value">{{ hubUptime || 'N/A' }}</span></div>
          <div class="hub-latest-mqtt-status"><p class="label" title="The time of the last status message from the hub.">Latest MQTT Status</p><span class="value">{{ lastMqttStatus || 'N/A' }}</span></div>
          <div class="latest-cell-state"><p class="label" title="The time of the last cellular status message from the hub.">Latest Cell Status</p><span class="value">{{ latestCellStatus || 'N/A' }}</span></div>
        </div>
      </div>

        <!-- Devices section -->
        <div v-if="deviceLinks.length > 0" class="devices">
        <div class="list-hdr">Devices</div>
        <StationDevices
            :devices="deviceLinks"
            :getDeviceTypeFromSerial="getDeviceTypeFromSerial"
            :requestor="requestor"
        />
        </div>
        <div>
            <div class="list-hdr">Station Info</div>
            <StationInfo
                :stationDetails="stationDetails"
            />
        </div>
        <HardwareModal
          :hardwareType="hubHardware.hardware_type"
          :hardwareName ="this.hardwareType"
          ref="showHardwareModal"
        />
  </div>
  </template>

<script>
import Diagnostics from '@/helpers/Diagnostics';
import DataDisplay from '@/helpers/DataDisplay';
import DeviceStatus from '@/helpers/DeviceStatus';
import StationDevices from './StationDevices.vue';
import StationInfo from './StationInfo.vue';
import HardwareModal from './HardwareModal.vue';
import Day from '@/helpers/Day';

export default {
  components: {
    StationDevices,
    StationInfo,
    HardwareModal: HardwareModal
  },
  props: {
    stationDetails: Object,
    formatTimestamp: Function,
    requestor: Object,
    index: Number,
  },
  data() {
    return {
      diagnostics: null,
      hub: {},
      hubHardware: {},
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
      hardwareType: null,
      isTempestOne: false,
      selectedDeviceId: null
    };
  },
  computed: {
    stationHub() {
      return this.getHubForStation(this.stationDetails.devices);
    },
    generateBFLink() {
      const stationId = this.stationDetails?.station_id || 'default_station_id';
      const startDate = this.getFormattedDateForLink();

      return `https://wfx.weatherflow.com/vv/stns=${stationId}&sources=tempest&sdate=${startDate}&stime=6&dur=36&ptype=single`;
    }
  },
  methods: {
    getFormattedDateForLink() {
      const today = new Date();
      return today.toISOString().split('T')[0];
    },
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

      this.getHubHardwareInfo(hub.serial_number);
      this.isTempestOneHub(hub.serial_number);

      return hub;
    },
    async getHubHardwareInfo(serial) {
      try {
        const response = await this.requestor.makeGetRequest("device_locked_status", {serial_number: serial});

        if (response.status === 200) {
          this.hubHardware.hardware_type = response.data.hardware.hardware_type;
          this.hubHardware.ethernet = response.data.hardware.ethernet;
          this.hubHardware.wifi = response.data.hardware.wifi;
          this.hubHardware.device_locked = response.data.is_device_locked;

          const cellularStatus = this.cellularStatus;

          const connectivity = [];
          if (this.hubHardware.wifi) connectivity.push('Wifi');
          if (this.hubHardware.ethernet) connectivity.push('Ethernet');
          if (cellularStatus !== null) {
            connectivity.push(`Cellular (${cellularStatus})`);
          }

          this.hubHardware.connectivity = connectivity.length > 0 ? connectivity.join(' / ') : 'no connection';
        }

      } catch (error) {
        console.error('Error fetching device_locked_status:', error);
      }
    },
    async isTempestOneHub(serial) {
      try {
        const response = await this.requestor.makeTempestOneGetRequest("device_locked_status", {serial_number: serial});
        if (response.data.status.status_code === 0) {
          if (response.data.is_tempest_one_hub) {
            this.isTempestOne = true;
          }
        }
      } catch (error) {
        console.error('Error fetching device_locked_status:', error);
      }
    },
    initializeDiagnostics() {
      this.diagnostics = new Diagnostics({
        locationId: this.stationDetails.location_id,
        ready: () => {
          this.updateDiagnosticsData();
          this.updateDeviceData();
          // After diagnostics are initialized and cellular status is updated
          this.getHubHardwareInfo(this.stationHub.serial_number);
        },
      });
    },
    updateDiagnosticsData() {
      this.hubFrequency = this.diagnostics.freq();
      this.efr32Firmware = this.diagnostics.efr32Firmware();
      this.hubRssi = DataDisplay.userWifiSignalDisplay(this.diagnostics.rssi());
      this.hubState = this.diagnostics.state();
      this.hubUptime = this.diagnostics.getHubUptime();
      this.cellularStatus = this.diagnostics.getCellularStatus();
      this.lastMqttStatus = Day.getFuzzyTimestampWithEpoch(this.diagnostics.getLastMQTTStatus());
      this.latestCellStatus = Day.getFuzzyTimestampWithEpoch(this.diagnostics.getCellularTimestamp());
      this.devices = this.diagnostics.getDevices();
    },
    updateDeviceData() {
      const filteredDevices = this.stationDetails.devices.filter(device => device.device_type !== "HB");
      const filteredDeviceInfo = this.devices.filter(device => device.device_type !== "HB");

      this.deviceLinks = filteredDevices.map(device => {
        const matchingDeviceInfo = filteredDeviceInfo.find(infoDevice => infoDevice.device_id === device.device_id);

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
          statusText: this.deviceStatus.findStatus(matchingDeviceInfo?.sensor_status, device.device_type),
          status: matchingDeviceInfo.sensor_status,
          rssi: matchingDeviceInfo?.rssi || 'N/A',
          battery: matchingDeviceInfo?.voltage || 'N/A',
          uptime: DataDisplay.calculateUptimeDay(matchingDeviceInfo?.uptime) || 'N/A',
          lastMqtt: Day.getFuzzyTimestampWithEpoch(matchingDeviceInfo?.last_mqtt_ob_epoch) || 'N/A',
          lastWs: Day.getFuzzyTimestampWithEpoch(matchingDeviceInfo?.last_ob_epoch) || 'N/A'
        };
      });
    },
    getModuleInformation(hardwareRevision) {
      if (hardwareRevision === '0') {
        return 'Avnet (0)';
      } else if (hardwareRevision === '1') {
        return 'Laird (1)';
      } else if (hardwareRevision === '2') {
        return 'Espressif (2)';
      } else {
        return hardwareRevision;
      }
    },
    getHubIdentifier(id) {
      switch(id) {
      case 0:
        this.hardwareType = 'WF-HUB01 (0)';
        return this.hardwareType;
      case 1:
        this.hardwareType = 'WF-HUBP (1)';
        return this.hardwareType;
      case 2:
        this.hardwareType = 'TH-HUB-01 (2)';
        return this.hardwareType;
      case 3:
        this.hardwareType = 'T1-HUB-01 (3)';
        return this.hardwareType;
      case 4:
        this.hardwareType = 'T1-HUBC-01a (4)';
        return this.hardwareType;
      case 5:
        this.hardwareType = 'T1-HUBC-01b (5)';
        return this.hardwareType;
      }
    },
    getDeviceTypeFromSerial(serial) {
      return DataDisplay.getDeviceTypeFromSerial(serial);
    },
    showHardwareImage() {
      this.$refs.showHardwareModal.showModal();
    },
  },
  mounted() {
    this.initializeDiagnostics();
    this.deviceStatus = new DeviceStatus();
  }
};
</script>
