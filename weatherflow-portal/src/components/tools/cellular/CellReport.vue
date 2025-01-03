<template>
    <div>
      <!-- Equivalent to the includes/header.html can go in a parent layout or App.vue -->

      <!-- Centered container for hardware type selector & summary table -->
      <div class="centered-container">
        <div class="selector">
          <h2>Select Hardware Type</h2>
          <label for="hardware-type-select">Hardware Type:</label>
          <select
            id="hardware-type-select"
            v-model="selectedHardwareType"
          >
            <!-- Options to match your original HTML snippet -->
            <option value="1">Interim (WF-HUBP)</option>
            <option value="4">North America (T1-HUBC-01a)</option>
            <option value="5">Rest of World (T1-HUBC-01b)</option>
            <option value="1,4,5">All Hardware Types</option>
          </select>

          <!-- Null device count -->
          <h3 class="null-devices">
            {{ nullDeviceCount }} Hub Serial Numbers provisioned, but not set up yet.
          </h3>
        </div>

        <!-- Summary table section -->
        <div class="summary">
          <h2>Summary</h2>
          <table id="summary-table">
            <thead>
              <tr>
                <th>SIM Name</th>
                <th>Online</th>
                <th>Offline</th>
                <!-- Render SKU headers only if showing all hardware types -->
                <th v-for="sku in uniqueSkus" :key="sku">
                  {{ sku }}
                </th>
              </tr>
            </thead>
            <tbody>
              <!-- Rows for each SIM/carrier -->
              <tr
                v-for="(simData, simName) in summaryData"
                :key="simName"
              >
                <td>{{ simName }}</td>
                <td>{{ simData.online }}</td>
                <td>{{ simData.offline }}</td>
                <td v-for="sku in uniqueSkus" :key="sku">
                  {{ simData[sku] || 0 }}
                </td>
              </tr>
              <!-- Totals row -->
              <tr>
                <td>Total</td>
                <td>{{ allTotals.online }}</td>
                <td>{{ allTotals.offline }}</td>
                <td
                  v-for="sku in uniqueSkus"
                  :key="sku"
                >
                  {{ allTotals[sku] || 0 }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Data table container -->
      <div id="datatable-container">
        <table v-if="filteredDevices.length > 0">
          <thead>
            <tr>
              <th>Email</th>
              <th>Serial Number</th>
              <th>Firmware Revision</th>
              <th>SIM</th>
              <th>Timezone</th>
              <th>State</th>
              <th>Hardware Type</th>
              <th>Cell Tower Location</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(device, index) in filteredDevices"
              :key="index"
            >
              <td>
                <template v-if="device.user">
                  <a :href="`/sw/users/${device.user.email_address}`">
                    {{ device.user.email_address }}
                  </a>
                </template>
                <template v-else>N/A</template>
              </td>
              <td>
                <a :href="`/sw/devices/serial_number/${device.serial_number}`">
                  {{ device.serial_number }}
                </a>
              </td>
              <td>{{ device.firmware_revision || "" }}</td>
              <td>{{ carrierName(device) }}</td>
              <td>{{ device.location?.timezone || "N/A" }}</td>
              <td>{{ showState(device.location?.status) }}</td>
              <td>{{ device.sku || "N/A" }}</td>
              <td>{{ cellTowerLocation(device) }}</td>
            </tr>
          </tbody>
        </table>
        <div
          v-else-if="!isLoading"
          style="text-align:center; padding: 20px;"
        >
          No devices found.
        </div>
      </div>

      <!-- Map Section -->
      <div class="map-ctn">
        <div ref="map" id="map"></div>
      </div>

      <!-- Loader (Spinner) -->
      <div id="loader" v-if="isLoading"></div>
    </div>
  </template>

  <script>
  import apiKeyGoogle from "../../../../config.json"
  export default {
    name: "CellHubReport",
    data() {
      return {
        isLoading: false,
        selectedHardwareType: "1,4,5",
        devices: [], // full list of device objects from API
        map: null,   // for Google Map instance
      };
    },
    computed: {
      /**
       * Filter out null-device-id entries so we only display valid devices.
       */
      filteredDevices() {
        return this.devices.filter((d) => d.device_id !== null);
      },
      /**
       * Count how many devices have a null device_id.
       */
      nullDeviceCount() {
        return this.devices.filter((d) => d.device_id == null).length;
      },
      /**
       * True if selectedHardwareType is "1,4,5" meaning "all hardware types".
       */
      isAllHardwareTypes() {
        return this.selectedHardwareType === "1,4,5";
      },
      /**
       * Compute an array of unique SKUs (only if "all" hardware types).
       */
      uniqueSkus() {
        if (!this.isAllHardwareTypes) return [];
        const skus = this.devices.map((d) => d.sku || "Unknown SKU");
        return [...new Set(skus)]; // unique array
      },
      /**
       * Build up the summary object keyed by carrier (SIM name).
       */
      summaryData() {
        const summary = {
          Telstra: { online: 0, offline: 0 },
          Hologram: { online: 0, offline: 0 },
          Aeris: { online: 0, offline: 0 },
          "AT&T": { online: 0, offline: 0 }
        };
        // If "all" hardware types, add each SKU property to each carrier
        if (this.isAllHardwareTypes) {
          Object.keys(summary).forEach((carrier) => {
            this.uniqueSkus.forEach((sku) => {
              summary[carrier][sku] = 0;
            });
          });
        }

        for (const device of this.filteredDevices) {
          const carrier = this.carrierName(device);
          if (!summary[carrier]) {
            // If unknown carrier, initialize
            summary[carrier] = { online: 0, offline: 0 };
            if (this.isAllHardwareTypes) {
              this.uniqueSkus.forEach((sku) => {
                summary[carrier][sku] = 0;
              });
            }
          }

          const stateKey = device.location?.status === 1 ? "online" : "offline";
          summary[carrier][stateKey] = (summary[carrier][stateKey] || 0) + 1;

          if (this.isAllHardwareTypes) {
            const skuVal = device.sku || "Unknown SKU";
            if (summary[carrier][skuVal] === undefined) {
              summary[carrier][skuVal] = 0;
            }
            summary[carrier][skuVal]++;
          }
        }

        return summary;
      },
      /**
       * Totals row across all carriers.
       */
      allTotals() {
        const totals = { online: 0, offline: 0 };
        if (this.isAllHardwareTypes) {
          this.uniqueSkus.forEach((sku) => {
            totals[sku] = 0;
          });
        }

        for (const carrier in this.summaryData) {
          const dataObj = this.summaryData[carrier];
          totals.online += dataObj.online || 0;
          totals.offline += dataObj.offline || 0;
          if (this.isAllHardwareTypes) {
            for (const sku of this.uniqueSkus) {
              totals[sku] += dataObj[sku] || 0;
            }
          }
        }
        return totals;
      }
    },
    watch: {
      selectedHardwareType() {
        this.loadData();
      },
      devices() {
        this.drawMarkers();
      }
    },
    mounted() {
      document.title = "Cell Hub Report";
      this.loadGoogleMapsScript()
      .then(() => {
        this.initMap();
      })
      .catch((error) => {
        console.error("Google Maps script could not be loaded:", error);
      });
      this.loadData();
    },
    methods: {
        loadGoogleMapsScript() {
            return new Promise((resolve, reject) => {
                if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
                resolve();
                } else {
                const existingScript = document.getElementById('googleMapsScript');
                if (!existingScript) {
                    const script = document.createElement('script');
                    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKeyGoogle}`;
                    script.async = true;
                    script.defer = true;
                    script.id = 'googleMapsScript';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                } else {
                    existingScript.onload = resolve;
                    existingScript.onerror = reject;
                }
                }
            });
    },
      async loadData() {
        this.isLoading = true;
        try {
          const url = `https://development-swd.weatherflow.com/tempestinternal/hub_search?hardware_type=${this.selectedHardwareType}&format=json`;
          const response = await fetch(url);
          const data = await response.json();
          this.devices = data.devices || [];
        } catch (error) {
          console.error("Failed to load data:", error);
        } finally {
          this.isLoading = false;
        }
      },

      /* ------------------------------------------------------------------
       * Google Map
       * ------------------------------------------------------------------ */
      initMap() {
        if (!window.google || !window.google.maps) {
          console.error("Google Maps not available!");
          return;
        }
        const center = { lat: 31.061, lng: -84.728 };
        this.map = new google.maps.Map(this.$refs.map, {
          zoom: 4,
          center
        });
      },
      drawMarkers() {
        if (!this.map || !window.google?.maps) return;

        // (Optional) If you want to remove existing markers, store them in an array and remove them before re-drawing.

        for (const device of this.filteredDevices) {
          if (device.location?.lat && device.location?.lon) {
            // Main marker
            const marker = new google.maps.Marker({
              position: { lat: device.location.lat, lng: device.location.lon },
              map: this.map,
              title: device.serial_number
            });

            const infoContent = `
              <div>
                <h3>${device.serial_number}</h3>
                <p><strong>State:</strong> ${
                  device.location.status === 1 ? "online" : "offline"
                }</p>
                <p><strong>Country:</strong> ${device.location.timezone || "N/A"}</p>
                <p><strong>Carrier:</strong> ${
                  device.latest_cell_status_cellular
                    ? this.getCarrierName(device.latest_cell_status_cellular.iccid)
                    : "N/A"
                }</p>
              </div>
            `;
            const infowindow = new google.maps.InfoWindow({ content: infoContent });
            marker.addListener("click", () => {
              infowindow.open(this.map, marker);
            });

            // If there's a second marker for last session
            if (device.hologram_device?.lastsession) {
              const session = device.hologram_device.lastsession;
              if (session.latitude != null && session.longitude != null) {
                const sessionMarker = new google.maps.Marker({
                  position: { lat: session.latitude, lng: session.longitude },
                  map: this.map,
                  icon: {
                    url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                  },
                  title: `${device.serial_number} - Last Session`
                });

                const cellInfoWindow = new google.maps.InfoWindow({
                  content: "<div><h3>Cell Tower Location</h3><p>Loading address...</p></div>"
                });
                sessionMarker.addListener("click", () => {
                  cellInfoWindow.open(this.map, sessionMarker);
                });

                // Reverse geocode to update content
                this.reverseGeocode(session.latitude, session.longitude, (address) => {
                  cellInfoWindow.setContent(`
                    <div>
                      <h3>Cell Tower Location</h3>
                      <p>${address}</p>
                    </div>
                  `);
                });

                // Draw line between device location and cell tower
                const line = new google.maps.Polyline({
                  path: [
                    { lat: device.location.lat, lng: device.location.lon },
                    { lat: session.latitude, lng: session.longitude }
                  ],
                  geodesic: true,
                  strokeColor: "#FF0000",
                  strokeOpacity: 1.0,
                  strokeWeight: 2
                });
                line.setMap(this.map);
              }
            }
          }
        }
      },

      reverseGeocode(lat, lng, callback) {
        const geocoder = new google.maps.Geocoder();
        const latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };

        geocoder.geocode({ location: latlng }, (results, status) => {
          if (status === "OK") {
            if (results[0]) {
              callback(results[0].formatted_address);
            } else {
              console.log("No results found");
              callback("No address found");
            }
          } else {
            console.log("Geocoder failed due to: " + status);
            callback("Geocoding failed");
          }
        });
      },

      /* ------------------------------------------------------------------
       * Utilities
       * ------------------------------------------------------------------ */
      carrierName(device) {
        const iccid = device.latest_cell_status_cellular?.iccid || "";
        return this.getCarrierName(iccid);
      },
      cellTowerLocation(device) {
        const session = device.hologram_device?.lastsession;
        if (session?.latitude != null && session?.longitude != null) {
          return `${session.latitude}, ${session.longitude}`;
        }
        return "N/A";
      },
      getCarrierName(simCode) {
        if (simCode.startsWith("89610")) {
          return "Telstra";
        } else if (simCode.startsWith("894450")) {
          return "Hologram";
        } else if (simCode.startsWith("89011702") || simCode.startsWith("891850")) {
          return "Aeris";
        } else if (simCode.startsWith("89011703")) {
          return "AT&T";
        } else {
          return "Unknown Carrier";
        }
      },
      showState(state) {
        return state === 1 ? "online" : "offline";
      }
    }
  };
  </script>

  <!-- Remove `scoped` so the global CSS rules (#datatable-container, .map-ctn, etc.) apply -->
  <style>
/* General Styles */
body {
    font-size: 16px;
    font-family: 'Roboto', sans-serif;
    margin: 0;
    background-color: #f7f9fc;
    color: #333;
}

h2, h3 {
    color: #512b59;
}

/* Centered Container */
.centered-container {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    text-align: center;
    padding: 20px;
}

/* Select Styling */
label {
    font-size: 1rem;
    color: #444;
}

select {
    padding: 8px;
    font-size: 1rem;
    border-radius: 4px;
    border: 1px solid #ccc;
    margin-left: 8px;
    transition: border-color 0.3s;
}

select:focus {
    border-color: #512b59;
    outline: none;
}

/* Table Container */
#datatable-container {
    max-width: 1100px;
    margin: 0 auto;
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

#datatable-container-info {
    max-width: 1100px;
    margin: 0 auto;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* Table Styling */
table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    padding: 12px;
    text-align: center;
    border-bottom: 1px solid #ddd;
}

th {
    background-color: #512b59;
    color: white;
    font-weight: bold;
    position: sticky;
    top: 0;
    z-index: 1; /* Keep header above table rows */
}

tr:nth-child(even) {
    background-color: #f9f9f9;
}

thead th:nth-child(1), tbody td:nth-child(1) {
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

/* Loader */
#loader {
    border: 10px solid #f3f3f3; /* Light grey */
    border-top: 10px solid #512b59;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: none;
    z-index: 9999;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Map Container */
.map-ctn {
    max-width: 1100px;
    margin: 20px auto;
    height: 80vh;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

#map {
    width: 100%;
    height: 100%;
}

/* Summary Table Styling */
#summary-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    background-color: #fff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

#summary-table th, #summary-table td {
    padding: 8px 12px;
    text-align: center;
    border: 1px solid #ddd;
}

#summary-table th {
    background-color: #512b59;
    color: white;
}

#summary-table tbody tr:nth-child(even) {
    background-color: #f9f9f9;
}

  </style>
