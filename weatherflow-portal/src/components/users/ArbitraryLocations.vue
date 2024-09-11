<template>
  <div v-if="arbitraryLocations.length > 0" class="arb-locations">
    <div class="list-hdr">
      Arbitrary Locations ({{ arbitraryLocations.length }})
    </div>
    <div id="general-list">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Location</th>
            <th>Timezone</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="location in arbitraryLocations" :key="location.arbitrary_location_id">
            <td>{{ location.arbitrary_location_id }}</td>
            <td>{{ location.name }}</td>
            <td>{{ getFixedValue(location.latitude, 2) }}, {{ getFixedValue(location.longitude, 2) }}</td>
            <td>{{ location.timezone }}</td>
          </tr>
        </tbody>
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
    getFixedValue(value, precision) {
      return value ? value.toFixed(precision) : 'N/A';
    },
    async fetchArbitraryLocations() {
      if (!this.requestor || !this.userId) {
        return;
      }

      try {
        const response = await this.requestor.makeGetRequest("locations_stats", { user_id: this.userId });

        if (response.data.status.status_code === 0) {
          if (response.data.arbitrary_locations.length > 0) {
            this.arbitraryLocations = response.data.arbitrary_locations;
          }
        }
      } catch (error) {
        console.error("Error fetching arbitrary locations", error);
      }
    }
  },
  watch: {
    userId() {
      this.fetchArbitraryLocations();
    },
    requestor() {
      if (this.requestor) {
        this.fetchArbitraryLocations();
      }
    }
  },
  mounted() {
    if (this.userId && this.requestor) {
      this.fetchArbitraryLocations();
    }
  },
};
</script>