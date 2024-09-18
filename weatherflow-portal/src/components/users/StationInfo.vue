<template>
  <table class="devices-table">
    <thead>
      <tr>
        <th>Timezone</th>
        <th>Location</th>
        <th>Elevation</th>
        <th>Local Only</th>
        <th>Coastal Zone</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{{ stationDetails.timezone }}</td>
        <td>
          <a target="_blank" :href="getMapLink(getFixedValue(stationDetails.latitude, 2), getFixedValue(stationDetails.longitude, 2))">{{ getFixedValue(stationDetails.latitude, 2) }}, {{ getFixedValue(stationDetails.longitude, 2) }}</a>
          <a target="_blank" :href="getMapLinkT1(stationDetails.latitude, stationDetails.longitude)">(T1)</a>
        </td>
        <td>{{ getFixedValue(stationDetails.station_meta.elevation, 2) }}m</td>
        <td>{{ stationDetails.is_local_mode }}</td>
        <td>
          <div id="coastal-zone">
            <select name="coastal-zone-options" id="coastal-zone-options" class="value" @change="onCoastalZoneChange($event.target.value)" v-model="coastalZone">
              <option v-for="(label, value) in coastalExclusionOptions" :key="value" :value="value">
                {{ label }}
              </option>
            </select>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>


<script>
export default {
  props: {
    stationDetails: Object,
    requestor: Object
  },
  computed: {
    coastalZone() {
      return this.stationDetails.coastal_zone
    }
  },
  data() {
    return {
      coastalExclusionOptions: {
        0: "(0) Pending / WU not Allowed",
        1: "(1) Coastal Zone / WU not Allowed",
        2: "(2) Not in Coastal Zone / WU Allowed",
        3: "(3) Not in Coastal Zone / Shared with WU",
        4: "(4) Override / WU Allowed",
        5: "(5) Override / WU not Allowed",
        6: "(6) Override / WU not Allowed",
        7: "(7) Override / WU Allowed"
      }
    };
  },
  methods: {
    getFixedValue(value, precision) {
      return value ? value.toFixed(precision) : "N/A";
    },
    getMapLinkT1(lat, lon) {
      return `https://one.weatherflow.com/map#${lat},${lon},18,1`;
    },
    getMapLink(lat, lon) {
      return `https://tempestwx.com/map/${this.stationDetails.station_id}/${lat}/${lon}/15`;
    },
    onCoastalZoneChange(selectedValue) {
      const locationId = this.stationDetails.station_id;
      this.updateCoastalExclusion(locationId, selectedValue);
    },
    async updateCoastalExclusion(locationId, flag) {
      let urlData = {
        location_id: locationId,
        coastal_zone_exclusion_flag: flag
      };

      try {
        const response = await this.requestor.makePutRequest("account_management/coastal_zone_exclusion_flag", urlData);

        if (response.data.status_code == 0 && response.data.status_message == "SUCCESS") {
          alert("Coastal zone successfully updated.");
        }
      } catch (error) {
        alert("Error updating coastal zone.");
      }
    }
  }
};
</script>