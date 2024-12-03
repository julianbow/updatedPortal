<template>
    <div id="firmware-nightly">
        <main>
        <div id="button-container">
            <div id="firmware-switch-container">
            <label class="label" :class="{ enabled: isFirmwareOn }">
                Firmware Updates are {{ isFirmwareOn ? "ON" : "OFF" }}
            </label>
            <label class="switch">
                <input type="checkbox" v-model="isFirmwareOn" @change="toggleFirmwareUpdates($event.target.checked)" />
                <span class="slider round"></span>
            </label>
            </div>
            <div>
            <label for="hour-selector">Select Hour: </label>
            <select id="hour-selector" v-model="selectedHour" @change="onHourChange">
                <option value="">Select hour...</option>
                <option v-for="hour in hours" :key="hour" :value="hour">
                {{ hour }}
                </option>
            </select>
            </div>
        </div>

        <p id="msg">Nightly firmware update process targets the local 4am hour.</p>

        <div id="devices">
            <h2 v-if="firmwareItems.length">Hour {{ selectedHour }}</h2>
            <table v-if="firmwareItems.length">
            <thead>
                <tr>
                <th>Status</th>
                <th>Serial</th>
                <th>Firmware</th>
                <th>Pending</th>
                <th>Timezone</th>
                <th>Hardware Revision</th>
                <th>User</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in firmwareItems" :key="item.serial_number">
                <td>
                    <span :class="'station-status-' + item.online_status"></span>
                </td>
                <td>{{ item.serial_number }}</td>
                <td class="firmware">{{ item.firmare_revision }}</td>
                <td class="firmware">{{ item.pending_firmare_revision }}</td>
                <td>{{ item.timezone }}</td>
                <td>{{ item.hardware_revision }}</td>
                <td v-html="getEmailWithSearchLink(item.email)"></td>
                </tr>
            </tbody>
            </table>
        </div>
        </main>
    </div>
</template>

<script>
import Requestor from "@/helpers/Requestor";

export default {
  name: "FirmwareNightly",
  data() {
    return {
      requestor: new Requestor(),
      isFirmwareOn: false,
      selectedHour: localStorage.getItem("selectedHour") || 4,
      hours: Array.from({ length: 24 }, (_, i) => i + 1),
      firmwareItems: [],
    };
  },
  methods: {
    async fetchFirmwareItems() {
      const urlData = { local_hour: this.selectedHour, limit: 100 };
      try {
        const response = await this.requestor.makeTempestInternalGetRequest("tempestinternal/firmware_work_list", urlData);
        const data = response.data;
        if (data.status && data.status.status_code === 0) {
            this.isFirmwareOn = data.is_firmware_update_system_on || false;
            this.firmwareItems = data.firmware_update_items || [];
        } else {
            this.isFirmwareOn = false;
            this.firmwareItems = [];
        }
      } catch (error) {
        console.error("Error fetching firmware items:", error);
      }
    },
    async toggleFirmwareUpdates(newState) {
        const toggleState = newState ? "on" : "off";
        const urlData = {
            value: toggleState,
            name: "firmware_auto_update_system_on_off_switch",
        };

        try {
            const response = await this.requestor.makeTempestInternalGetRequest("tempestinternal/system_settings", urlData);
            const data = response.data;

            if (data.status && data.status.status_code === 0) {
                this.isFirmwareOn = newState;
            } else {
                console.error("Failed to toggle firmware updates:", data.status);
                alert("Error: Unable to toggle firmware updates.");
            }
        } catch (error) {
            console.error("Error toggling firmware updates:", error);
            alert("Error: Unable to connect to the server.");
        }
    },
    onHourChange() {
        localStorage.setItem("selectedHour", this.selectedHour);
        this.fetchFirmwareItems();
    },
    getEmailWithSearchLink(email) {
        return `<a href="/search?query=${encodeURIComponent(email)}">${email}</a>`;
    },
    updateTitle() {
        this.$emit("update-title", "Firmware Updates - Hub Nightly");
    },
  },
  mounted() {
    this.updateTitle();
    this.fetchFirmwareItems();
  },
};
</script>


<style scoped>
/* General Styles */
#firmware-nightly {
    display: block;
    width: 100%;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 4px #0000001a;
    max-width: 960px;
    margin: 90px auto;
    padding: 20px;
}

#firmware-switch-container {
    display: flex;
    align-items: center;
    gap: 10px;
}

#msg {
    text-align: center;
}

header h1 {
    text-align: center;
    margin-bottom: 20px;
}

/* Button Container */
#button-container {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    margin-bottom: 20px;
}

.label {
    font-weight: bold;
}

.label.enabled {
    color: green;
}

.switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 26px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 26px;
}

.slider.round {
    border-radius: 26px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    border-radius: 50%;
    background-color: white;
    transition: 0.4s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    top: 4px;
    left: 4px;
}

input:checked + .slider {
    background-color: #4caf50;
}

input:checked + .slider:before {
    transform: translateX(24px);
}

/* Focus state for better accessibility */
input:focus + .slider {
    box-shadow: 0 0 1px #4caf50;
}


/* Table Styles */
table {
    width: 100%;
    border-collapse: collapse;
}

thead th {
    background-color: #f4f4f4;
    text-align: left;
    padding: 8px;
}

tbody td {
    padding: 8px;
    border-bottom: 1px solid #ddd;
}

.firmware {
    text-align: center;
}

.station-status-online {
    color: green;
}

.station-status-offline {
    color: red;
}
</style>
