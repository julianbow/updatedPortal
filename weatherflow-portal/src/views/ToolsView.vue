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
          { title: "Firmware Updates - Hub Nightly", path: "/tools/firmware-nightly" },
          { title: "Firmware List (Hub & Tempest)", path: "/tools/firmware-list" },
          { title: "QC Dashboard", path: "/tools/qc-dashboard" },
          // combine CS network management and Prod
          { title: "Network Management", path: "/tools/network-management" },
          { title: "Custom Networks", path: "/tools/networks" },
          { title: "VIP Users", path: "/tools/vip" },
          // comibne cellular hub info and report
          { title: "Cellular Hub Info", path: "/tools/cell-hub-info" },
          { title: "Cell Hub Report", path: "/tools/cell-hub-report" },
        ],
      };
    },
    methods: {
        navigateTo(path) {
            this.$router.push(path);
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
    height: 80px;
    text-align: center;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 10px 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    color: #512b59;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s, background-color 0.3s;
    overflow: hidden;
    display: flex;
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
