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
            <a>{{ getFixedValue(stationDetails.latitude, 2) }}, {{ getFixedValue(stationDetails.longitude, 2) }}</a>
            <a target="_blank" :href="getMapLink(stationDetails.latitude, stationDetails.longitude)">T1</a>
          </td>
          <td>{{ getFixedValue(stationDetails.station_meta.elevation, 2) }}m</td>
          <td>{{ stationDetails.is_local_mode }}</td>
          <td>
            <div id="coastal-zone">
              <select name="coastal-zone-options" id="coastal-zone-options" class="value" v-model="coastalZone">
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
  },
  computed: {
    coastalZone() {
      return this.stationDetails.coastal_zone
    }
  },
  data() {
    return {
      selectedCoastalZone: 2, // Default selected value for coastal zone
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
    getMapLink(lat, lon) {
      return `https://one.weatherflow.com/map#${lat},${lon},18,1`;
    }
  }
};
</script>
