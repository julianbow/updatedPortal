<template>
    <div class="modal-ctn" v-if="showModal">
      <div class="modal-content">
        <span class="modal-close" @click="closeModal"></span>
        <div class="addContract">
          <div class="contractButtons">
            <div class="station-input-group">
              <input v-model="addStationInput" type="text" placeholder="Add one station">
              <button class="button" @click="addStation">Add Station</button>
            </div>
            <div class="station-input-group">
              <input v-model="removeStationInput" type="text" placeholder="Remove one station">
              <button class="button" @click="removeStation">Remove Station</button>
            </div>
          </div>
          <div class="contractButtonsBulk">
            <button class="button" @click="triggerFileUpload('add')">Add Contract Stations</button>
            <input
              ref="csvFileUpload"
              type="file"
              id="csvFileUpload"
              accept=".csv"
              @change="handleFileUpload('add')"
              hidden>
            <button class="button" @click="triggerFileUpload('replace')">Replace Contract Stations</button>
            <input
              ref="csvFileReplace"
              type="file"
              id="csvFileReplace"
              accept=".csv"
              @change="handleFileUpload('replace')"
              hidden>
          </div>
          <p class="infoText">Only accepts a .csv file of multiple stations</p>
        </div>

        <div id="general-list">
          <table class="table">
            <thead>
              <tr>
                <th>Contract Stations in Network ({{ stations.length }})</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="station in stations" :key="station">
                <td><a :href="`/devices/station_id/${station}`">{{ station }}</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>

<script>
export default {
  name: "UploadContractModal",
  props: {
    showModal: {
      type: Boolean,
      required: true
    },
    stations: {
      type: Array,
      default: () => []
    },
    requestor: Object, // Use your Requestor object for API calls
    networkId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      addStationInput: "",
      removeStationInput: ""
    };
  },
  methods: {
    closeModal() {
      this.$emit("close");
    },
    async addStation() {
      try {
        if (!this.addStationInput.trim()) {
          throw new Error("Please enter a station ID.");
        }

        const stationId = this.addStationInput.trim();
        const data = {
          update_type: "ADD_CONTRACT_STATION",
          station_id: stationId
        };

        const response = await this.requestor.makePutRequestDev(`tempestinternal/network/${this.networkId}/stations`, data);

        if (response.data.status.status_code === 0) {
          alert("Station added successfully");
          window.location.reload();
        } else {
          throw new Error(response.status.status_message);
        }

        this.addStationInput = "";
      } catch (error) {
        alert("Failed to add station: " + error.message);
      }
    },
    async removeStation() {
      if (this.removeStationInput.trim()) {
        const stationId = this.removeStationInput.trim();
        const data = {
          update_type: "REMOVE_CONTRACT_STATION",
          station_id: stationId
        };

        const response = await this.requestor.makePutRequestDev(`tempestinternal/network/${this.networkId}/stations`, data);

        if (response.data.status.status_code === 0) {
          alert("Station removed successfully");
          window.location.reload();
        } else {
          throw new Error(response.status.status_message);
        }

        this.removeStationInput = "";
      } else {
        alert("Please enter a station ID.");
      }
    },
    triggerFileUpload(type) {
      if (type === "add") {
        this.$refs.csvFileUpload.click();
      } else if (type === "replace") {
        this.$refs.csvFileReplace.click();
      }
    },
    async handleFileUpload(type) {
      try {
        const fileInput = type === "add" ? this.$refs.csvFileUpload : this.$refs.csvFileReplace;
        const file = fileInput.files[0];

        if (!file) {
          throw new Error("No file selected");
        }
        const formData = new FormData();
        formData.append("file", file);

        const endpoint = `tempestinternal/network/${this.networkId}/stations`;
        let response;
        if (type === "add") {
            response = await this.requestor.makePostRequestDevCSV(endpoint, formData);
        } else {
            response = await this.requestor.makePutRequestDevCSV(endpoint, formData);
        }

        if (response.data.status_code === 0) {
            alert("CSV successfully uploaded");
            window.location.reload();
        } else {
            throw new Error(response.data.status.status_message || 'Unknown error occurred');
        }

        fileInput.value = "";
      } catch (error) {
        alert("Error uploading CSV: " + error.message);
      }
    }
  }
};
</script>


  <style scoped>
  .modal-ctn {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal-content {
    background: #fff;
    padding: 40px;
    border-radius: 15px;
    width: 100%;
    max-width: 650px;
    max-height: 500px;
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.2);
    position: relative;
  }

  .modal-content {
    scrollbar-width: thin;
    scrollbar-color: #512b59 transparent;
  }

  .addContract {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #fff;
    padding: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 -2px 4px rgba(0, 0, 0, 0.1), 2px 0 4px rgba(0, 0, 0, 0.1), -2px 0 4px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    margin: 10px auto;
  }

  .contractButtons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    width: 100%;
  }

  .contractButtonsBulk {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    width: 85%;
  }

  .contractButtonsBulk button {
    flex: 1;
  }

  .infoText {
    font-style: italic;
    color: #666;
    text-align: center;
    width: 100%;
  }

  .station-input-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    width: 85%;
  }

  .station-input-group input {
    flex: 2;
  }

  .station-input-group button {
    flex: 1;
  }

  input[type="text"] {
    padding: 10px;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 3px;
    font-size: 16px;
    width: 100%;
    margin: 5px 0;
    color: #512b59;
    box-sizing: border-box;
}

  </style>
