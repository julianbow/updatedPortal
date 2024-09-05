class DeviceStatus {
  constructor(settings, target) {
    this.target = target;
    const defaultSettings = {};
    this.settings = { ...defaultSettings, ...settings };

    // Define the sensors object as part of the instance
    this.sensors = {
      AR: [
        {
          label: "Temperature",
          flags: [
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.AIR_TEMPERATURE_FAILED,
              type: "error"
            }
          ]
        },
        {
          label: "RH",
          flags: [
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.AIR_RH_FAILED,
              type: "error"
            }
          ]
        },
        {
          label: "Lightning",
          flags: [
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.AIR_LIGHTNING_FAILED,
              type: "error"
            },
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.AIR_LIGHTNING_DISTURBER,
              failedText: "Disturber",
              type: "warning"
            },
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.AIR_LIGHTNING_NOISE,
              failedText: "Noise",
              type: "warning"
            }
          ]
        }
      ],
      SK: [
        {
          label: "Wind",
          flags: [
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.SKY_WIND_FAILED,
              type: "error"
            }
          ]
        },
        {
          label: "Precip",
          flags: [
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.SKY_PRECIP_FAILED,
              type: "error"
            }
          ]
        },
        {
          label: "Light / UV",
          flags: [
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.SKY_LIGHT_UV_FAIL,
              type: "error"
            }
          ]
        }
      ],
      ST: [
        {
          label: "Temperature",
          flags: [
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.AIR_TEMPERATURE_FAILED,
              type: "error"
            }
          ]
        },
        {
          label: "RH",
          flags: [
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.AIR_RH_FAILED,
              type: "error"
            }
          ]
        },
        {
          label: "Lightning",
          flags: [
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.AIR_LIGHTNING_FAILED,
              type: "error"
            },
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.AIR_LIGHTNING_DISTURBER,
              failedText: "Disturber",
              type: "warning"
            },
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.AIR_LIGHTNING_NOISE,
              failedText: "Noise",
              type: "warning"
            }
          ]
        },
        {
          label: "Air Pressure",
          flags: [
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.AIR_PRESSURE_FAILED,
              type: "error"
            },
          ]
        },
        {
          label: "Precip",
          flags: [
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.SKY_PRECIP_FAILED,
              type: "error"
            },
          ]
        },
        {
          label: "Light / UV",
          flags: [
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.SKY_LIGHT_UV_FAIL,
              type: "error"
            },
          ]
        },
        {
          label: "Light Sensor Type",
          flags: [
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.LITR_LIGHT_SENSOR,
              failedText: "LTR",
              type: "normal"
            },
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.LITR_SENSOR_TYPE,
              failedText: "Si1133",
              type: "normal"
            },
          ],
          passedText: "APDS9200"
        },
        {
          label: "Power Mode",
          flags: [
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.LOW_POWER_MODE1,
            },
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.LOW_POWER_MODE2,
            },
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.LOW_POWER_MODE3,
            },
          ]
        },
        {
          label: "Power Booster",
          flags: [
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.ROCKET_DETECTED,
              failedText: "Detected",
              type: "normal"
            },
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.ROCKET_ENABLED,
              failedText: "Enabled",
              type: "normal"
            },
            {
              flag: DeviceStatus.SENSOR_STATUS_FLAGS.ROCKET_SHORE_POWER,
              failedText: "External Power",
              type: "normal"
            }
          ],
          passedText: "Not Detected"
        }
      ]
    };
  }

  // Static method to find status
  findStatus(status, deviceType) {
    let warning = 0;
    let failure = 0;
    let success = 0;

    const deviceSensors = this.sensors[deviceType];

    for (let x = 0; x < deviceSensors.length; x++) {
      const sensorItem = deviceSensors[x];

      for (let i = 0; i < sensorItem.flags.length; i++) {
        const sensorFlag = sensorItem.flags[i];

        if (this._hasSensorError(status, sensorFlag.flag)) {
          if (sensorFlag.type === "error") {
            failure += 1;
          } else if (sensorFlag.type === "warning") {
            warning += 1;
          } else {
            success += 1;
          }
        } else {
          success += 1;
        }
      }
    }

    if (failure > 0) {
      return "failure";
    } else if (warning > 0) {
      return "warning";
    } else if (success > 0){
      return "success";
    }
  }

  // Static helper method
  _hasSensorError(status, flag) {
    let retval = false;

    if ((status & flag) != 0) {
      retval = true;
    }

    return retval;
  }
}

// Add static properties to the class
DeviceStatus.SENSOR_STATUS_FLAGS = {
  AIR_TEMPERATURE_FAILED: "temp_failed",
  AIR_RH_FAILED: "rh_failed",
  AIR_LIGHTNING_FAILED: "lightning_failed",
  AIR_LIGHTNING_DISTURBER: "lightning_disturber",
  AIR_LIGHTNING_NOISE: "lightning_noise",
  SKY_WIND_FAILED: "wind_failed",
  SKY_PRECIP_FAILED: "precip_failed",
  SKY_LIGHT_UV_FAIL: "light_uv_fail"
};

// Export the class
export default DeviceStatus;
