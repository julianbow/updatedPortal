<template>
    <div class="arb-locations">
      <div class="list-hdr">
        Arbitrary Locations ({{ arbitraryLocations.length }})
      </div>
      <div id="general-list">
          <table v-if="arbitraryLocations.length">
            <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Timezone</th>
                </tr>
            </thead>
            <tr v-for="location in arbitraryLocations" :key="location.arbitrary_location_id">
              <td>{{ location.arbitrary_location_id }}</td>
              <td>{{ location.name }}</td>
              <td>{{ getFixedValue(location.latitude, 2) }}, {{ getFixedValue(location.longitude, 2) }}</td>
              <td>{{ location.timezone }}</td>
            </tr>
          </table>
      </div>
    </div>
  </template>

<script>
export default {
  props: {
    arbitraryLocations: Array,
  },
  methods: {
    getFixedValue(value, precision) {
      return value ? value.toFixed(precision) : 'N/A';
    },
  },
};
</script>