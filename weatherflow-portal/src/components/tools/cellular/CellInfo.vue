<template>
    <div>

      <h2 class="list-hdr">Cell Hub Info</h2>
      <table class="table">
        <thead>
          <tr>
            <th @click="sortTable('deviceId')">Device ID</th>
            <th @click="sortTable('serialNumber')">Serial Number</th>
            <th @click="sortTable('timestampReceived')">Last Status Message (UTC)</th>
            <th @click="sortTable('successEpoch')">Last Successful Call (UTC)</th>
            <th @click="sortTable('source')">Source</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in sortedRows" :key="row.deviceId">
            <td>{{ row.deviceId }}</td>
            <td>
              <a :href="`/devices/search/${row.serialNumber}`">
                {{ row.serialNumber }}
              </a>
            </td>
            <td>{{ row.timestampReceivedFormatted }}</td>
            <td>{{ row.lastSuccessfulCallFormatted }}</td>
            <td>{{ row.source }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>

  <script>
  import dayjs from "dayjs";
  import utc from "dayjs/plugin/utc";
  dayjs.extend(utc);

  export default {
    name: "CellHubInfo",
    data() {
      return {
        isLoading: false,
        rows: [],
        sortKey: "timestampReceived",
        sortOrder: 1
      };
    },
    mounted() {
      document.title = "Cell Hub Info";

      this.fetchData();
    },
    computed: {
      sortedRows() {
        return [...this.rows].sort((a, b) => {
          if (a[this.sortKey] === b[this.sortKey]) return 0;
          return a[this.sortKey] > b[this.sortKey] ? this.sortOrder : -this.sortOrder;
        });
      }
    },
    methods: {
      fetchData() {
        this.isLoading = true;
        const url =
          "https://development-swd.weatherflow.com/tempestinternal/redis_data?key=latest_cell_status_message&api_key=bd59e158-8890-11ee-b9d1-0242ac120002";

        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            this.processData(data);
            this.isLoading = false;
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            this.isLoading = false;
          });
      },
      processData(data) {
        // 'data.hash' is an object where each key is a device ID
        const hashKeys = Object.keys(data.hash || {});

        // Convert each entry into a more Vue-friendly structure
        this.rows = hashKeys.map((hashKey) => {
          const obj = JSON.parse(data.hash[hashKey]);

          // Basic fields
          const deviceId = hashKey;
          const serialNumber = obj.serial_number;
          const source = obj.source || "mqtt";

          // Timestamps
          const timestampReceived = obj.timestamp_received; // raw epoch (seconds)
          const timestampReceivedFormatted = dayjs(timestampReceived * 1000)
            .utc()
            .format("YYYY-MM-DD HH:mm:ss [UTC]");

          // Last successful call
          let successEpoch;
          if (source === "ble") {
            successEpoch = obj.value[9];
          } else {
            successEpoch = obj.value[11];
          }
          let lastSuccessfulCallFormatted = "N/A";
          if (successEpoch && successEpoch !== 0) {
            lastSuccessfulCallFormatted = dayjs(successEpoch * 1000)
              .utc()
              .format("YYYY-MM-DD HH:mm:ss [UTC]");
          }

          return {
            deviceId,
            serialNumber,
            source,
            timestampReceived,
            timestampReceivedFormatted,
            successEpoch,
            lastSuccessfulCallFormatted
          };
        });
      },
      sortTable(key) {
        if (this.sortKey === key) {
          this.sortOrder = -this.sortOrder;
        } else {
          this.sortKey = key;
          this.sortOrder = 1;
        }
      }
    }
  };
  </script>

  <style scoped>
  .list-hdr {
    margin: 0;
  }
  </style>
