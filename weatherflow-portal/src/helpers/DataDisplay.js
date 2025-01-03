class DataDisplay {
  static getValue(value) {
    return value !== undefined && value !== null ? value : "";
  }

  static getRoundedValue(value) {
    value = this.getValue(value);

    if (value !== "" && !isNaN(value)) {
      value = Math.round(value * 100) / 100;
    }

    return value;
  }

  static getBooleanValue(value) {
    return value !== undefined && value !== null ? value : false;
  }

  static getNumberWithPrecision(value, precision) {
    let retval = "";

    value = this.getValue(value);

    if (value !== "") {
      retval = value.toFixed(precision);
    }

    return retval;
  }

  static getEmailWithLink(email, uid) {
    email = this.getValue(email);
    uid = this.getValue(uid);

    if (email !== "" && uid !== "") {
      return `<a href='/sw/users/${uid}'>${email}</a>`;
    } else if (email !== "") {
      return email;
    }

    return "";
  }

  static getEmaillWithSearchLink(email) {
    email = this.getValue(email);

    if (email !== "") {
      return `<a target='_blank' href='/sw/users/search/${email}'>${email}</a>`;
    }

    return email;
  }

  static getSerialWithLogLink(serialNumber) {
    serialNumber = this.getValue(serialNumber);

    if (serialNumber !== "") {
      return `<a href='http://portal.weatherflow.com/sw/factory-tests/${serialNumber}'>${serialNumber}</a>`;
    }

    return "";
  }

  static getSerialWithLogLinkAndReboot(serialNumber) {
    const str = this.getSerialWithLogLink(serialNumber);

    if (serialNumber !== "") {
      return `${str} <a href='#' class='reboot-hub' data-serial-number='${serialNumber}'>Reboot</a>`;
    }

    return str;
  }

  static getDeviceDataDownloadLink(deviceId, stationTimeZone) {
    deviceId = this.getValue(deviceId);
    stationTimeZone = this.getValue(stationTimeZone);

    if (deviceId !== "" && stationTimeZone !== "") {
      return `<a href='#' title='Download device data' data-device-id='${deviceId}' data-timezone='${stationTimeZone}'>Data Download</a>`;
    }

    return "";
  }

  static getDeviceIdWithLink(deviceId) {
    deviceId = this.getValue(deviceId);

    if (deviceId !== "") {
      return `<a href='http://swd.weatherflow.com/swd/device.html?device_id=${deviceId}' target='_blank'>${deviceId}</a>`;
    }

    return "";
  }

  static getDeviceIdWithLinkAndEventLogLink(deviceId) {
    deviceId = this.getValue(deviceId);

    if (deviceId !== "") {
      return `<a href='#' title='View device event log' data-device-id='${deviceId}'>Event Log</a>`;
    }

    return "";
  }

  static getTempestWxLinkWithName(deviceId, name) {
    deviceId = this.getValue(deviceId);

    if (deviceId !== "") {
      return `<a href='https://tempestwx.com/station/${deviceId}' target='_blank'>${name}</a>`;
    }

    return "";
  }

  static getFirmwareRevisionWithUpgradeLink(firmware, serialNumber, deviceType) {
    firmware = this.getValue(firmware);
    serialNumber = this.getValue(serialNumber);
    deviceType = this.getValue(deviceType);

    if (serialNumber !== "" && firmware !== "" && deviceType !== "") {
      return `${firmware}<a href='#' class='upgrade-firmware' data-current-firmware='${firmware}' data-serial-number='${serialNumber}' data-device-type='${deviceType}'></a>`;
    } else if (firmware !== "") {
      return firmware;
    }

    return false;
  }

  static getDeviceTypeFromSerial(serialNumber) {
    serialNumber = this.getValue(serialNumber);

    if (serialNumber !== "") {
      return serialNumber.substring(0, 2);
    }

    return "";
  }

  static getSerialWithoutDeviceType(serialNumber) {
    serialNumber = this.getValue(serialNumber);

    if (serialNumber !== "") {
      const parts = serialNumber.split("-");

      if (parts.length > 0) {
        return parts[1];
      }
    }

    return "";
  }

  static userWifiSignalDisplay = function (value) {
    var signal;

    switch (true) {
    case value === null:
      signal = "Not Connected";
      break;
    case value <= -99:
      signal = "Not Connected";
      break;
    case value < -80:
      signal = `Weak (${value})`;
      break;
    case value < -70 && value >= -80:
      signal = `Good (${value})`;
      break;
    case value >= -70:
      signal = `Strong (${value})`;
      break;
    }

    return signal;
  };

  static calculateUptimeDay = function (value) {
    if (value) {
      const SECONDS_PER_DAY = 86400;
      const days = Math.floor(value / SECONDS_PER_DAY);

      return `${days}d`;
    }
    return null;
  }
}

export default DataDisplay;
