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
        <p id="search-results-count" style="text-align: center;">{{ searchResults.length }} results found</p>
        <table id="search-list">
          <thead>
            <tr>
              <th @click="sortTable('device_id')">Device Id</th>
              <th @click="sortTable('serial')">Serial</th>
              <th @click="sortTable('device_name')">Device</th>
              <th @click="sortTable('env')">Env</th>
              <th @click="sortTable('firmware')">Firm</th>
              <th @click="sortTable('location')">Location</th>
              <th @click="sortTable('user')">User</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="device in sortedResults" :key="device.device_id">
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
        initialSortKey: 'device_id',
        initialSortDirection: 'asc',
        sortKey: this.initialSortKey,
        sortDirection: this.initialSortDirection,
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
                this.$router.push({ path: `/devices/search/${this.searchTerm}` });

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
        sortTable(key) {
            if (this.sortKey === key) {
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortKey = key;
                this.sortDirection = 'asc';
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
            ? `<a href="https://tempestwx.com/station/${locationId}">${locationName}</a>`
            : '---';
        },
        getEmailWithLink(email, userId) {
            return email ? `<a href="/users/${userId}">${email}</a>` : '---';
        },
        updateTitle() {
            this.$emit('update-title', "Devices");
        }
    },
    computed: {
        sortedResults() {
        return this.searchResults.slice().sort((a, b) => {
            let modifier = this.sortDirection === 'asc' ? 1 : -1;
            if (a[this.sortKey] < b[this.sortKey]) return -1 * modifier;
            if (a[this.sortKey] > b[this.sortKey]) return 1 * modifier;
            return 0;
        });
        }
    },
    watch: {
        '$route.params.term'(newSearchTerm) {
            if (newSearchTerm) {
                this.searchTerm = newSearchTerm;
                this.searchDevices();
            }
        }
    },
    mounted() {
        this.requestor = new Requestor();
        this.updateTitle();

        const searchTermFromRoute = this.$route.params.term;
        if (searchTermFromRoute) {
            this.searchTerm = searchTermFromRoute;
            this.searchDevices();
        }
    }
  };
  </script>

