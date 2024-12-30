<template>
  <div>
    <h1 class="list-hdr">CPO QC</h1>
    <table class="table">
      <thead>
        <tr>
          <th
            v-for="col in displayFormat"
            :key="col.csv_column"
            @click="sortTable(col.csv_column)"
            :class="{ active: sortColumn === col.csv_column }"
          >
            {{ col.header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in displayedRows" :key="rowIndex">
          <td
            v-for="col in displayFormat"
            :key="col.csv_column"
            :class="getCellClass(col.csv_column, row[col.csv_column])"
            v-html="formatCellValue(col.csv_column, row[col.csv_column])"
          ></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import dayjs from 'dayjs';

const format = [
  { csv_column: "station_id", display: false, header: null },
  { csv_column: "device_id", display: true, header: "Device Id" },
  { csv_column: "email", display: true, header: "Email" },
  { csv_column: "device_firmware", display: true, header: "Device FW" },
  { csv_column: "last_ob_time", display: true, header: "Last Ob" },
  { csv_column: "device_status", display: true, header: "State" },
  { csv_column: "temp_flag", display: true, header: "Temp" },
  { csv_column: "pressure_flag", display: true, header: "Pressure" },
  { csv_column: "light_flag", display: true, header: "Light" },
  { csv_column: "wind_flag", display: true, header: "Wind" },
  { csv_column: "flag_count", display: true, header: "Flag Count" },
  { csv_column: "hub_fw", display: true, header: "Hub FW" },
  { csv_column: "low_power_modes", display: true, header: "Time in M2/M3" },
  { csv_column: "vmin", display: true, header: "Min V" },
  { csv_column: "null_count", display: true, header: "Null Count" },
  { csv_column: "device_serial", display: true, header: "Serial" },
  { csv_column: "battery_flag", display: true, header: "Battery Flag" }
];

const displayColumns = format.filter(col => col.display).map(col => col.csv_column);

export default {
  name: 'CPOQC',
  data() {
    return {
      rows: [],
      sortColumn: null,
      sortOrder: 'asc',
    };
  },
  computed: {
    displayFormat() {
      return format.filter(f => f.display);
    },
    displayedRows() {
      if (!this.sortColumn) return this.rows;

      return [...this.rows].sort((a, b) => {
        const valA = a[this.sortColumn];
        const valB = b[this.sortColumn];

        if (valA < valB) return this.sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    },
  },
  mounted() {
    document.title = "CPO QC";
    this.fetchData();
  },
  methods: {
    fetchData() {
      fetch("https://ft.weatherflow.com/dev-tempest_cpo_checkup.csv")
        .then(response => response.text())
        .then(data => this.parseCSV(data));
    },
    parseCSV(data) {
      const lines = data.trim().split("\n");

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
        case "email":
        case "device_serial":
          return `<a target="_blank" href="http://portal.weatherflow.com/sw/devices/${value}">${value}</a>`;
        case "device_id":
          return `<a target="_blank" href="http://swd.weatherflow.com/swd/device.html?device_id=${value}">${value}</a>`;
        case "last_ob_time":
          const ot = dayjs(value);
          return ot.isValid() ? ot.format("DD MMM HH:mm") : value;
        default:
          return value;
      }
    },
    getCellClass(column, value) {
      if (
        column === "temp_flag" ||
        column === "pressure_flag" ||
        column === "light_flag" ||
        column === "wind_flag" ||
        column === "battery_flag"
      ) {
        return value === "PASS" ? "green" : "red";
      }
      if (column === "device_status") {
        return value === "online" ? "green" : "red";
      }
      return '';
    },
    sortTable(column) {
      if (this.sortColumn === column) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortOrder = 'asc';
      }
    },
  },
};
</script>

<style scoped>
body {
  font-size: 16px;
  font-family: Roboto, sans-serif;
  margin: 0;
}
td, th {
  padding: 8px 4px;
  border-bottom: 1px solid #AE9AB3;
  font-size: 0.79em;
  text-align: center;
}
th {
  background-color: #AE9AB3;
  color: white;
  cursor: pointer;
}
th.active {
  font-weight: bold;
}
.list-hdr {
  margin: 0;
}
.green {
  color: green;
}
.red {
  color: red;
}
</style>
