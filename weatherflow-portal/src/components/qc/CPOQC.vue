<template>
    <div>
      <h1>CPO QC</h1>
      <table>
        <thead>
          <tr>
            <th v-for="col in displayFormat" :key="col.csv_column">
              {{ col.header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in displayedRows" :key="rowIndex">
            <td v-for="col in displayFormat" :key="col.csv_column"
                :class="getCellClass(col.csv_column, row[col.csv_column])"
                v-html="formatCellValue(col.csv_column, row[col.csv_column])">
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>

  <script>
import dayjs from 'dayjs';
  const USERNAME = "username";
  const STATION_ID = "station_id";
  const DEVICE_ID = "device_id";
  const EMAIL = "email";
  const DEVICE_FIRMWARE = "device_firmware";
  const LAST_OB_TIME = "last_ob_time";
  const DEVICE_STATUS = "device_status";
  const DOWNTIME_PCT_24HR = "downtime_percentage_last_24hr";
  const DOWNTIME_PCT_120HR = "downtime_percentage_last_120hr";
  const TEMP_FLAG = "temp_flag";
  const PRESSURE_FLAG = "pressure_flag";
  const LIGHT_FLAG = "light_flag";
  const WIND_FLAG = "wind_flag";
  const FLAG_COUNT = "flag_count";
  const STRIKE_COUNT = "strike_count";
  const TOTAL_PRECIP = "total_precip";
  const VMAX = "vmax";
  const VMIN = "vmin";
  const VRANGE = "vrange";
  const HUB_FIRMWARE = "hub_fw";
  const LOW_POWER_MODES = "low_power_modes";
  const INDOOR = "indoor";
  const NULL_COUNT = "null_count";
  const FALSE_RAIN_PCT = "false_rain_pct";
  const DEBUG_MINUTES = "debug_minutes";
  const USERSEEN_MINUTES = "userseen_minutes";
  const DEVICE_SERIAL = "device_serial";
  const BATTERY_FLAG = "battery_flag";

  const format = [
    { csv_column: STATION_ID, display: false, header: null },
    { csv_column: DEVICE_ID, display: true, header: "Device Id" },
    { csv_column: EMAIL, display: true, header: "Email" },
    { csv_column: DEVICE_FIRMWARE, display: true, header: "Device FW" },
    { csv_column: LAST_OB_TIME, display: true, header: "Last Ob" },
    { csv_column: DEVICE_STATUS, display: true, header: "State" },
    { csv_column: DOWNTIME_PCT_24HR, display: false, header: null },
    { csv_column: DOWNTIME_PCT_120HR, display: false, header: null },
    { csv_column: TEMP_FLAG, display: true, header: "Temp" },
    { csv_column: PRESSURE_FLAG, display: true, header: "Pressure" },
    { csv_column: LIGHT_FLAG, display: true, header: "Light" },
    { csv_column: WIND_FLAG, display: true, header: "Wind" },
    { csv_column: FLAG_COUNT, display: true, header: "Flag Count" },
    { csv_column: STRIKE_COUNT, display: false, header: null },
    { csv_column: TOTAL_PRECIP, display: false, header: null },
    { csv_column: VMAX, display: false, header: null },
    { csv_column: VMIN, display: true, header: "Min V" },
    { csv_column: VRANGE, display: false, header: null },
    { csv_column: HUB_FIRMWARE, display: true, header: "Hub FW" },
    { csv_column: LOW_POWER_MODES, display: true, header: "Time in M2/M3" },
    { csv_column: INDOOR, display: false, header: null },
    { csv_column: NULL_COUNT, display: true, header: "Null Count" },
    { csv_column: FALSE_RAIN_PCT, display: false, header: null },
    { csv_column: DEBUG_MINUTES, display: false, header: null },
    { csv_column: USERSEEN_MINUTES, display: false, header: null },
    { csv_column: DEVICE_SERIAL, display: true, header: "Serial" },
    { csv_column: BATTERY_FLAG, display: true, header: "Battery Flag" }
  ];

  const displayColumns = [
    EMAIL,
    DEVICE_SERIAL,
    DEVICE_ID,
    DEVICE_FIRMWARE,
    HUB_FIRMWARE,
    LAST_OB_TIME,
    DEVICE_STATUS,
    TEMP_FLAG,
    PRESSURE_FLAG,
    LIGHT_FLAG,
    WIND_FLAG,
    BATTERY_FLAG,
    FLAG_COUNT,
    NULL_COUNT,
    VMIN,
    LOW_POWER_MODES
  ];

  export default {
    name: 'CPOQC',
    data() {
      return {
        rows: []
      };
    },
    computed: {
      displayFormat() {
        return displayColumns.map(colKey => format.find(f => f.csv_column === colKey && f.display));
      },
      displayedRows() {
        // If you wish to sort or filter, do it here.
        return this.rows;
      }
    },
    mounted() {
      document.title = "CPO QC";
      this.fetchData();
    },
    methods: {
      fetchData() {
        fetch("https://ft.weatherflow.com/dev-tempest_cpo_checkup.csv")
          .then(response => response.text())
          .then(data => {
            this.parseCSV(data);
          });
      },
      parseCSV(data) {
        const lines = data.trim().split("\n");
        // first line is header in the CSV, skip it since we have predefined format
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",");
          if (cols.length < format.length) continue;

          const rowObj = {};
          for (let j = 0; j < format.length; j++) {
            const colDef = format[j];
            rowObj[colDef.csv_column] = cols[j];
          }
          this.rows.push(rowObj);
        }
      },
      formatCellValue(column, value) {
        switch (column) {
          case EMAIL:
          case DEVICE_SERIAL:
            return `<a target="_blank" href="http://portal.weatherflow.com/sw/devices/${value}">${value}</a>`;
          case DEVICE_ID:
            return `<a target="_blank" href="http://swd.weatherflow.com/swd/device.html?device_id=${value}">${value}</a>`;
          case LAST_OB_TIME:
            const ot = dayjs(value);
            return ot.isValid() ? ot.format("DD MMM HH:mm") : value;
          default:
            // For columns that have pass/fail, we handle CSS class separately
            return value;
        }
      },
      getCellClass(column, value) {
        switch (column) {
          case TEMP_FLAG:
          case PRESSURE_FLAG:
          case LIGHT_FLAG:
          case WIND_FLAG:
          case BATTERY_FLAG:
          case VMIN:
          case INDOOR:
          case DEVICE_FIRMWARE:
          case HUB_FIRMWARE:
          case FLAG_COUNT:
          case LOW_POWER_MODES:
          case NULL_COUNT:
            return this.getPassFailCSSClass(value);
          case DEVICE_STATUS:
            return this.getStateCSSClass(value);
          default:
            return '';
        }
      },
      getPassFailCSSClass(value) {
        return value === "PASS" ? "green" : "red";
      },
      getStateCSSClass(value) {
        return value === "online" ? "green" : "red";
      }
    }
  };
  </script>

  <style scoped>
  body {
    font-size: 16px;
    font-family: Roboto, sans-serif;
  }
  table {
    border-collapse: collapse;
    width: 100%;
  }
  td, th {
    padding: 8px 4px;
    border-bottom: 1px solid #ccc;
    font-size: 0.813em;
    text-align: center;
  }
  th {
    background-color: #ccc;
  }
  tr:nth-child(even) {
    background: #eee;
  }
  thead th:nth-child(1),
  tbody td:nth-child(1) {
    text-align: left;
  }
  tbody td:nth-child(7) {
    text-transform: uppercase;
  }
  .green {
    color: green;
  }
  .red {
    color: red;
  }
  </style>
