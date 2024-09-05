<template>
    <table class="devices-table">
        <thead>
            <tr>
                <th>Timezone</th>
                <th>Local Only</th>
                <th>Location</th>
                <th>Coastal Zone</th>
                <th>Elevation</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ stationDetails.timezone }}</td>
                <td>{{ stationDetails.is_local_mode }}</td>
                <td>
                    <a>{{ getFixedValue(stationDetails.latitude, 2) }}, {{ getFixedValue(stationDetails.longitude, 2) }}</a>
                    <a target='_blank' :href="getMapLink(stationDetails.latitude, stationDetails.longitude)">T1</a>
                </td>
                <td>{{ stationDetails.coastal_zone }}</td>
                <td>{{ getFixedValue(stationDetails.station_meta.elevation, 2) }}m</td>
            </tr>
        </tbody>
    </table>
</template>

<script>
export default {
  props: {
    stationDetails: Object,
  },
  methods: {
    getFixedValue(value, precision) {
      return value ? value.toFixed(precision) : 'N/A';
    },
    getMapLink(lat, lon) {
      return `https://one.weatherflow.com/map#${lat},${lon},18,1`;
    },
    getCoastalExclusion (item) {
      var str = ``;
      var flags = {
        0: "(0) Pending / WU not Allowed",
        1: "(1) Coastal Zone / WU not Allowed",
        2: "(2) Not in Coastal Zone / WU Allowed",
        3: "(3) Not in Coastal Zone / Shared with WU",
        4: "(4) Override / WU Allowed",
        5: "(5) Override / WU not Allowed",
        6: "(6) Override / WU not Allowed",
        7: "(7) Override / WU Allowed"
      };

      if (item != undefined) {
        // iterate through flags
        for (var i in flags) {
          if (item == i) {
            // add selected attribute
            str += `<option value='${i}' selected>${flags[i]}</option>`;
          } else {
            str += `<option value='${i}'>${flags[i]}</option>`;
          }
        }
        return str;
      } else {
        return undefined;
      }
    }
  }
}
</script>