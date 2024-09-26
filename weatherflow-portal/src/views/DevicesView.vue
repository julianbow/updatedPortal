<template>
    <div id="main">
      <div id="search-form" class="page-ctn">
        <div class="search-and-filters">
          <input
            id="search-box"
            type="text"
            v-model="searchTerm"
            @keyup.enter="searchDevices"
            placeholder="email, serial, name"
            autofocus
          />
          <div id="filter-container">
            <div id="filter-options">
              <form>
                <div v-for="filter in filters" :key="filter.id" class="radio-option">
                  <label :for="filter.id">{{ filter.label }}</label>
                  <input
                    type="radio"
                    :id="filter.id"
                    name="device-filter"
                    :value="filter.value"
                    v-model="selectedFilter"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <p v-if="noResults" class="err-msg">No search results found</p>

      <div id="search-results" v-if="searchResults.length">
        <p id="search-results-count">{{ searchResults.length }} results found</p>
        <table id="search-list">
          <thead>
            <tr>
              <th>Device Id</th>
              <th>Serial</th>
              <th>Device</th>
              <th>Env</th>
              <th>Firm</th>
              <th>Location</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="device in searchResults" :key="device.device_id">
                <td v-html="device.device_id"></td>
                <td v-html="device.serial"></td>
                <td v-html="device.device"></td>
                <td v-html="device.env"></td>
                <td v-html="device.firm"></td>
                <td v-html="device.location"></td>
                <td v-html="device.user"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>

  <script>
  import '../assets/css/main.css';
  import Requestor from '../helpers/Requestor';
  export default {
    data() {
      return {
        searchTerm: '',
        selectedFilter: 'search',
        noResults: false,
        searchResults: [],
        filters: [
          { id: 'all', label: 'All', value: 'search' },
          { id: 'station_name', label: 'Station Name', value: 'station_name' },
          { id: 'station_id', label: 'Station Id', value: 'station_id' },
          { id: 'device_id', label: 'Device Id', value: 'device_id' },
          { id: 'serial_number', label: 'Serial Number', value: 'serial_number' },
        ],
      };
    },
    methods: {
        async searchDevices() {
            if (this.searchTerm) {
                try {
                    const urlData = {
                        report_name: "devices_by_search",
                        [this.selectedFilter]: this.searchTerm
                    };

                    const response = await this.requestor.makePostRequest('report', urlData);

                    if (response.data && response.data.length > 0) {
                        this.searchResults = response.data.map((row) => {
                            const deviceIdDisplay = row.serial_number != null && !row.serial_number.startsWith("HB-")
                            ? this.getDeviceIdWithLink(row.device_id)
                            : this.getValue(row.device_id);

                            return {
                            device_id: deviceIdDisplay,
                            serial: this.getSerialWithLogLink(row.serial_number),
                            device: this.getValue(row.device_meta?.name),
                            env: this.getValue(row.device_meta?.environment),
                            firm: this.getValue(row.firmware_revision),
                            location: this.getLocationWithLink(row.location_name, row.location_id, row.location_meta?.share_with_wf),
                            user: this.getEmailWithLink(row.email_address, row.user_id)
                            };
                        });

                        this.noResults = false;
                    } else {
                        this.noResults = true;
                        this.searchResults = [];
                    }

                } catch (error) {
                    console.error('Error fetching search results:', error);
                    this.noResults = true;
                    this.searchResults = [];
                }
            }
        },

        getValue(value) {
            return value ? value : '---';
        },

        getDeviceIdWithLink(deviceId) {
            return `<a href="/device/${deviceId}">${deviceId}</a>`;
        },

        getSerialWithLogLink(serial) {
            return serial ? `<a href="/serial/${serial}">${serial}</a>` : '---';
        },

        getLocationWithLink(locationName, locationId, shareWithWf) {
            console.log()
            return locationName
            ? `<a href="/location/${locationId}">${locationName}</a>`
            : '---';
        },

        getEmailWithLink(email, userId) {
            return email ? `<a href="/user/${userId}">${email}</a>` : '---';
        }
    },
    mounted() {
      this.requestor = new Requestor();
    }
  };
  </script>

