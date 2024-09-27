<template>
  <div class="map-container" ref="mapContainer"></div>
</template>

<script>
export default {
  data() {
    return {
      map: null,
      center: { lat: 37.7749, lng: -122.4194 },
    };
  },
  methods: {
    loadGoogleMapsScript() {
      return new Promise((resolve, reject) => {
        if (typeof google !== 'undefined') {
          resolve();
        } else {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC9qipmnEx1OufwMtCs6wpTzRBBurnZARc`;
          script.async = true;
          script.defer = true;
          script.onload = resolve;
          document.head.appendChild(script);
        }
      });
    },
    initMap() {
      this.map = new google.maps.Map(this.$refs.mapContainer, {
        center: this.center,
        zoom: 12,
      });

      // Add a marker at the center
      new google.maps.Marker({
        position: this.center,
        map: this.map,
        draggable: true,
      });
    },
    updateTitle() {
      this.$emit('update-title', "Station Map");
    }
  },
  mounted() {
    this.updateTitle();
    this.loadGoogleMapsScript().then(() => {
      this.initMap();
    });
  }
};
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100vh;
  position: relative;
}
</style>
