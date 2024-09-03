import Requestor from "./Requestor";

class Diagnostics {
  constructor(settings = {}) {
    const defaultSettings = {
      locationId: null,
      ready: null,
    };

    this.settings = { ...defaultSettings, ...settings };
    this.data = null;

    this._getData();
  }

  async _getData() {
    this.requestor = new Requestor();
    const urlData = {
      verbose: true,
    };

    try {
      const response = await this.requestor.makeGetRequest(`diagnostics/${this.settings.locationId}`, urlData);

      if (response.data.status.status_code === 0) {
        this.data = response.data;

        if (typeof this.settings.ready === 'function') {
          this.settings.ready(this.settings.locationId);
        }
      }
    } catch (error) {
      console.error('Error fetching diagnostics data:', error);
    }
  }

  //   getLocationStatus() {
  //     if (this.data && this.data.state !== undefined) {
  //       return SWD.user.userLocationStatusDisplay(this.data.state);
  //     }
  //     return '';
  //   }

  getLastMQTTStatus() {
    return this.data && this.data.last_status_received_timestamp !== undefined
      ? this.data.last_status_received_timestamp
      : null;
  }

  getLastMQTTObservationTime() {
    return this.getLastMQTTStatus();
  }

  rssi() {
    return this.data && this.data.rssi !== undefined ? this.data.rssi : null;
  }

  freq() {
    if (this.data && this.data.freq !== undefined) {
      if (this.data.freq >= 863000000 && this.data.freq <= 864600000) {
        return 'Europe/CE';
      } else if (this.data.freq >= 902000000 && this.data.freq <= 912000000) {
        return 'North American/FCC';
      } else if (this.data.freq >= 915000000 && this.data.freq <= 923000000) {
        return 'Australasia/ACMA';
      }
    }
    return '';
  }

  state() {
    return this.data && this.data.state !== undefined ? this.data.state : null;
  }

  firmware() {
    return this.data && this.data.firmware_revision !== undefined
      ? this.data.firmware_revision
      : null;
  }

  efr32Firmware() {
    var efr32Firmware = null;
    console.log(this.data)

    if (this.data != null && this.data.radio_stats != undefined) {
      if (this.data.radio_stats != null && this.data.radio_stats.length >= 1) {
        efr32Firmware = this.data.radio_stats[0];
      }
    }

    return efr32Firmware;
  }

  getDevices() {
    return this.data && this.data.devices !== undefined ? this.data.devices : [];
  }

  getHubSerial() {
    return this.data && this.data.serial_number !== undefined
      ? this.data.serial_number
      : null;
  }

  getCellularStatus() {
    if (this.data && this.data.cellular_status !== undefined) {
      const cellStatus = this.data.cellular_status;

      switch (cellStatus) {
      case -1:
        return 'Not present';
      case 0:
        return 'Ready';
      case 1:
        return 'Failed';
      case 2:
        return 'Uninitialized';
      case 3:
        return 'Thread Failed';
      case 4:
        return 'No SIM';
      case 5:
        return 'Not registered';
      case 6:
        return 'Registered';
      case 7:
        return 'Sending data';
      default:
        return null;
      }
    }
    return null;
  }

  getCellularTimestamp() {
    var ts = null;

    let bleTime = typeof this.data.cell_status_ble !== 'undefined' ? this.data.cell_status_ble.timestamp_received : null;
    let mqttTime = typeof this.data.cell_status_mqtt !== 'undefined' ? this.data.cell_status_mqtt.timestamp_received : null;
    let cellTime = typeof this.data.cell_status_cellular !== 'undefined' ? this.data.cell_status_cellular.timestamp_received : null;

    if (bleTime !== null && bleTime > mqttTime && bleTime > cellTime) {
	  ts = bleTime;
    } else if (mqttTime !== null && mqttTime > bleTime && mqttTime > cellTime) {
	  ts = mqttTime;
    } else if (cellTime !== null && cellTime > bleTime && cellTime > mqttTime) {
	  ts = cellTime;
    }

    return ts;
  }

  getHubUptime() {
    if (this.data && this.data.uptime !== undefined) {
      const SECONDS_PER_DAY = 86400;
      const SECONDS_PER_HOUR = 3600;
      const SECONDS_PER_MINUTE = 60;

      const value = this.data.uptime;
      const days = Math.floor(value / SECONDS_PER_DAY);
      const daysRemainder = value % SECONDS_PER_DAY;
      const hours = Math.floor(daysRemainder / SECONDS_PER_HOUR);
      const hourRemainder = daysRemainder % SECONDS_PER_HOUR;
      const minutes = Math.floor(hourRemainder / SECONDS_PER_MINUTE);
      const minuteRemainder = hourRemainder % SECONDS_PER_MINUTE;

      return `${days}d ${hours}h ${minutes}m ${minuteRemainder}s`;
    }
    return null;
  }
}

export default Diagnostics;