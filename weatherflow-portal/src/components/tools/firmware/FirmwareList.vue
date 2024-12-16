<template>
	 <div id="main" class="firmware-tempest">
            <button class="button" @click="goBack">Back</button>
        <div class="buttons">
            <button @click="toggleTempestFirmware" class="button">Tempest Firmware</button>
            <button @click="toggleHubFirmware" class="button">Hub Firmware</button>
        </div>

		<!-- Hub Logs -->
		<div v-show="showHubFirmware" id="firmware-push-logs-hub">
		  <div id="tempest-hardware-version">
			 <div class="list-hdr">Hub Hardware Versions</div>
			 <table class="table">
				<thead>
				  <tr>
					 <th>Hardware Revision</th>
					 <th>Date</th>
					 <th>Name</th>
					 <th>Notes</th>
				  </tr>
				</thead>
				<tbody>
				  <tr>
					 <td>0</td>
					 <td>None</td>
					 <td>Avnet Module (WICED)</td>
					 <td>None</td>
				  </tr>
				  <tr>
					 <td>1</td>
					 <td>None</td>
					 <td>Laird Module (WICED)</td>
					 <td>None</td>
				  </tr>
				  <tr>
					 <td>2</td>
					 <td>Fall 2023</td>
					 <td>ESP32 (Espressif)</td>
					 <td>WF owned mac address sent to production in file, no more hmac</td>
				  </tr>
				</tbody>
			 </table>
		  </div>
		  <div id="tempest-firmware-bumps">
			 <div class="list-hdr">Hub Firmware Speed Bumps</div>
			 <p>All hubs &lt; v49 must get v49 before moving on up</p>
			 <p>All hubs on v143 must get v164 before moving on up</p>
			 <p>If hardware revision 0, The hub must be upgraded to v164 before proceeding to v194. But cannot upgrade to anything between 164 and 194.</p>
		  </div>
		</div>

		<!-- Tempest Logs -->
		<div v-show="showTempestFirmware" id="firmware-push-logs-tempest">
		  <div id="tempest-hardware-version">
			 <div class="list-hdr">Tempest Hardware Versions</div>
			 <table class="table">
				<thead>
				  <tr>
					 <th>Hardware Revision</th>
					 <th>Date</th>
					 <th>Name</th>
					 <th>Notes</th>
				  </tr>
				</thead>
				<tbody>
				  <tr>
					 <td>0</td>
					 <td>None</td>
					 <td>Release 1</td>
					 <td>None</td>
				  </tr>
				</tbody>
			 </table>
		  </div>
		  <div id="tempest-firmware-bumps">
			 <div class="list-hdr">Tempest Firmware Speed Bumps</div>
			 <p>None</p>
		  </div>
		</div>

		<!-- Tempest Firmware List -->
			 <!-- Unified Firmware Table -->
		  <div v-if="showTempestFirmware || showHubFirmware" id="firmware-table">
		  <div class="list-hdr">
				{{ showTempestFirmware ? "Tempest Firmware Versions" : "Hub Firmware Versions" }}
		  </div>
		  <table v-if="sortedFirmwareList.length > 0" class="table">
				<thead>
                    <tr>
                        <th @click="sortTable('firmware_revision')" :class="getSortClass('firmware_revision')">Firmware Revision</th>
                        <th @click="sortTable('hardware_revision')" :class="getSortClass('hardware_revision')">Hardware Revision</th>
                        <th @click="sortTable('device_type')" :class="getSortClass('device_type')">Device Type</th>
                        <th @click="sortTable('device_count')" :class="getSortClass('device_count')">Device Count</th>
                        <th @click="sortTable('firmware_id')" :class="getSortClass('firmware_id')">ID</th>
                        <th @click="sortTable('release_notes')" :class="getSortClass('release_notes')">Notes</th>
                        <th @click="sortTable('size')" :class="getSortClass('size')">Size</th>
                        <th @click="sortTable('url')" :class="getSortClass('url')">URL</th>
                    </tr>
				</thead>
				<tbody>
				<tr v-for="firmware in sortedFirmwareList" :key="firmware.firmware_id">
					 <td>{{ firmware.firmware_revision }}</td>
					 <td>{{ firmware.hardware_revision }}</td>
					 <td>{{ firmware.device_type }}</td>
					 <td>{{ firmware.device_count }}</td>
					 <td>{{ firmware.firmware_id }}</td>
					 <td>{{ firmware.release_notes || "None" }}</td>
					 <td>{{ firmware.size }}</td>
					 <td><a :href="firmware.url" target="_blank">{{ firmware.url }}</a></td>
				</tr>
				</tbody>
		  </table>
		  <p v-else>No firmware data available.</p>
		  </div>
	 </div>
  </template>

  <script>
	 import Requestor from "@/helpers/Requestor";

  export default {
	 name: 'FirmwareList',
	 data() {
		return {
		  requestor: new Requestor(),
		  showTempestFirmware: false,
		  showHubFirmware: false,
		  tempestFirmwareList: [],
		  hubFirmwareList: [],
          sortKey: 'Firmware Revision',
          sortDirection: 'asc',
		};
	 },
	 computed: {
		  currentFirmwareList() {
            return this.showTempestFirmware
                    ? this.tempestFirmwareList
                    : this.hubFirmwareList;
		  },
          sortedFirmwareList() {
                return this.currentFirmwareList.slice().sort((a, b) => {
                    let modifier = this.sortDirection === 'asc' ? 1 : -1;
                    if (a[this.sortKey] < b[this.sortKey]) return -1 * modifier;
                    if (a[this.sortKey] > b[this.sortKey]) return 1 * modifier;
                    return 0;
                });
            }
	 },
	 methods: {
        toggleTempestFirmware() {
            if (!this.showTempestFirmware) {
                this.showTempestFirmware = true;
                this.showHubFirmware = false;
            }
        },
        toggleHubFirmware() {
            if (!this.showHubFirmware) {
                this.showHubFirmware = true;
                this.showTempestFirmware = false;
            }
        },
		async fetchFirmwareList(deviceType) {
		  const urlData = { device_type: deviceType };

		  try {
			 const response = await this.requestor.makeTempestInternalGetRequest("tempestinternal/firmware_list", urlData);

			 if (response.data.status.status_code === 0) {
				  if (deviceType === 'ST') {
					 this.tempestFirmwareList = response.data.firmware || [];
				  } else {
					 this.hubFirmwareList = response.data.firmware || [];
				  }
			 }
		  } catch (err) {
			 console.error('Error fetching firmware list:', err);
			 return null;
		  }
		},
		updateTitle() {
		  this.$emit("update-title", "Firmware List (Hub & Tempest)");
		},
        sortTable(key) {
            if (this.sortKey === key) {
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortKey = key;
                this.sortDirection = 'asc';
            }
      },
      getSortClass(key) {
        return {
          up: this.sortDirection === 'asc' && this.sortKey === key,
        };
      },
        goBack() {
            this.$router.push({ name: 'tools' });
        }
	 },
	 mounted() {
		this.updateTitle();
		this.fetchFirmwareList('ST');
		this.fetchFirmwareList('HB');

        this.showTempestFirmware = true;
	 },
  };
  </script>

  <style scoped>
	 .firmware-tempest {
        display: block;
        width: 100%;
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 2px 4px #0000001a;
        margin: 90px auto !important;
		padding: 20px !important;
	 }

     .buttons {
        display: flex;
        justify-content: center;
        gap: 10px;
     }

	 .table th:nth-child(1) { width: 10%; }
	 .table th:nth-child(2) { width: 10%; }
	 .table th:nth-child(3) { width: 10%; }
	 .table th:nth-child(4) { width: 10%; }
	 .table th:nth-child(5) { width: 5%; }
	 .table th:nth-child(6) { width: 25%; }
     .table th:nth-child(7) { width: 5%; }

     .table th {
        cursor: pointer;
     }

	 #tempest-firmware, #hub-firmware {
		margin-top: 20px;
	 }

     #tempest-firmware-bumps, #hub-firmware-bumps {
        text-align: center;
     }

     #tempest-hardware-version, #hub-hardware-version, #tempest-firmware-bumps {
        width: 50%;
     }

	 #firmware-push-logs-tempest, #firmware-push-logs-hub {
        gap: 10px;
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        margin-top: 20px;
	 }

  </style>
