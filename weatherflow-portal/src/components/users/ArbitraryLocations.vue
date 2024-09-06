<template>
    <div>
      <div class="station-hdr">
        Arbitrary Locations ({{ arbitraryLocations.length }})
      </div>
      <div id="general-list">
          <table v-if="arbitraryLocations.length">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Location</th>
              <th>Timezone</th>
            </tr>
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
  data() {
    return {
      arbitraryLocations: [],
    };
  },
  props: {
    requestor: Object,
    userId: String,
  },
  methods: {
    async fetchArbitraryLocations(userId) {
      try {
        const response = await this.requestor.makeGetRequest("locations_stats", {user_id: userId});
        this.arbitraryLocations = response.data.arbitrary_locations;
      } catch (error) {
        console.error("Error fetching arbitrary locations", error);
      }
    },
    getFixedValue(value, precision) {
      return value ? value.toFixed(precision) : 'N/A';
    },
  },
  mounted() {
    const userId = this.userId;
    this.fetchArbitraryLocations(userId);
  },
};
</script>