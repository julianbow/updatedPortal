<template>
    <div id="tempest-tools">
      <h1>Tempest Tools</h1>
      <ul>
        <li v-for="tool in tools" :key="tool.title">
          <button @click="navigateTo(tool.path)" class="tool-button">
            <div class="title">{{ tool.title }}</div>
          </button>
        </li>
      </ul>
    </div>
  </template>

  <script>
  export default {
    name: "Tools",
    data() {
      return {
        tools: [
        //   { title: "Calibration Tool", path: "/tools/calibrate" },
          { title: "Firmware Updates - Hub Nightly", path: "/tools/firmware-nightly" },
          { title: "Firmware List (Hub & Tempest)", path: "/tools/firmware-list" },
          { title: "Rain AIS Admin", path: "/tools/rain-ais" },
          {
            title: "Rain AIS CSV",
            path: "https://swd.weatherflow.com/swd/rest/cl_device_qc_set?api_key=2bab16fe-18a5-45f5-a8ec-1087420a347e&format=csv",
            external: true,
          },
          { title: "Tempest Data QC", path: "/tools/tempest-qc" },
          { title: "CPO QC", path: "/tools/cpo-qc" },
          { title: "Cellular Hub Info", path: "/tools/cell-hub-info" },
          { title: "Customer Service Network Management", path: "/tools/network-management-cs" },
          { title: "Production Network Management", path: "/tools/network-management-prod" },
          { title: "Network Hubs", path: "/tools/hub-network-list" },
          { title: "Custom Networks", path: "/tools/networks" },
          { title: "VIP Users", path: "/tools/vip" },
          { title: "Cell Hub Report", path: "/tools/cell-hub-report" },
        ],
      };
    },
    methods: {
      navigateTo(path) {
        if (path.startsWith("http")) {
          // Open external link in a new tab
          window.open(path, "_blank");
        } else {
          // Use Vue Router to navigate internally without refreshing
          this.$router.push(path);
        }
      },
      updateTitle() {
        this.$emit("update-title", "Tools");
      },
    },
    mounted() {
      this.updateTitle();
    },
  };
  </script>

  <style scoped>
  h1 {
    color: #512b59;
  }

  #tempest-tools {
    max-width: 960px;
    margin: 100px auto;
    text-align: center;
  }

  #tempest-tools ul {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    list-style-type: none;
    padding: 0;
  }

  .tool-button {
    display: block;
    width: 100%;
    height: 80px; /* Fixed height for all buttons */
    text-align: center;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 10px 20px; /* Adjust padding for vertical alignment within fixed height */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    color: #512b59;
    font-size: 16px; /* Adjust font size for visual balance */
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s, background-color 0.3s;
    overflow: hidden; /* Prevent text overflow */
    display: flex; /* Flexbox for vertical and horizontal alignment */
    align-items: center;
    justify-content: center;
  }

    .tool-button:hover {
        transform: translateY(-5px);
        background-color: #f5f5f5;
    }

    .tool-button:focus {
        outline: none;
    }

  </style>
