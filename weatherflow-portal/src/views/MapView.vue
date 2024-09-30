<template>
  <div>
    <div class="map-container" ref="mapContainer"></div>
    <div id="station-info" v-if="stationInfoVisible">
      <h2>{{ stationInfo.name }}</h2>
      <p>{{ stationInfo.details }}</p>
      <button @click="closeStationInfo">Close</button>
    </div>
  </div>
</template>

<script>
import { apiKeyGoogle } from '../../config.json';
import Requestor from '@/helpers/Requestor';

export default {
  data() {
    return {
      map: null,
      defaultCenter: { lat: 31.061, lng: -84.728 },
      defaultZoom: 4,
      center: null,
      zoom: null,
      markers: [],
      currentSelectedMarker: null,
      previousBounds: null,
      stationInfoVisible: false,
      stationInfo: {},
    };
  },
  methods: {
    loadGoogleMapsScript() {
      return new Promise((resolve, reject) => {
        if (typeof google !== 'undefined') {
          resolve();
        } else {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKeyGoogle}`;
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
        zoom: this.zoom,
        scaleControl: true,
      });

      google.maps.event.addListener(this.map, 'idle', () => {
        this.getStations();
        this.updateRouteWithMapPosition(); // Update the URL when the map moves
      });
    },
    updateRouteWithMapPosition() {
      const center = this.map.getCenter();
      const zoom = this.map.getZoom();
      this.$router.push({
        name: 'MapView',
        params: {
          lat: center.lat().toFixed(5),
          lon: center.lng().toFixed(5),
          zoom: zoom,
        },
      });
    },
    async getStations() {
      console.log("getStations");
      const bounds = this.map.getBounds();
      const newBounds = this.calculateNewBounds(bounds);

      if (newBounds) {
        const urlData = {
          report_name: 'get_stations_by_bbox',
          min_lat: newBounds.getSouthWest().lat(),
          min_lon: newBounds.getSouthWest().lng(),
          max_lat: newBounds.getNorthEast().lat(),
          max_lon: newBounds.getNorthEast().lng(),
          device_type: ""
        };

        const response = await this.requestor.makePostRequest('report', urlData);

        if (response.data && response.status === 200) {
          const stations = response.data;
          this.addMarkers(stations);
          this.previousBounds = bounds;
        }
      }
    },
    addMarkers(stations) {
      this.clearMarkers();
      stations.forEach((station, index) => {
        const position = { lat: station.latitude, lng: station.longitude };
        const marker = new google.maps.Marker({
          position,
          map: this.map,
          title: station.name,
          icon: this.createMarkerSVG(false),
          zIndex: index,
        });
        marker.addListener('click', () => {
          this.showStationInfo(station, marker);
        });
        this.markers.push(marker);
      });
    },
    clearMarkers() {
      this.markers.forEach(marker => marker.setMap(null));
      this.markers = [];
    },
    createMarkerSVG(selected) {
      const color = selected ? '#00FF00' : '#008000';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                    <circle cx="10" cy="10" r="8" stroke="black" stroke-width="1" fill="${color}" />
                  </svg>`;
      return {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(20, 20),
      };
    },
    calculateNewBounds(bounds) {
      if (!this.previousBounds) return bounds;

      const newSW = bounds.getSouthWest();
      const prevSW = this.previousBounds.getSouthWest();
      const newNE = bounds.getNorthEast();
      const prevNE = this.previousBounds.getNorthEast();

      const newAreas = [];
      if (newSW.lng() < prevSW.lng()) {
        newAreas.push(new google.maps.LatLngBounds(new google.maps.LatLng(newSW.lat(), newSW.lng()), new google.maps.LatLng(newNE.lat(), prevSW.lng())));
      }
      if (newNE.lng() > prevNE.lng()) {
        newAreas.push(new google.maps.LatLngBounds(new google.maps.LatLng(newSW.lat(), prevNE.lng()), new google.maps.LatLng(newNE.lat(), newNE.lng())));
      }
      if (newSW.lat() < prevSW.lat()) {
        newAreas.push(new google.maps.LatLngBounds(new google.maps.LatLng(newSW.lat(), newSW.lng()), new google.maps.LatLng(prevSW.lat(), newNE.lng())));
      }
      if (newNE.lat() > prevNE.lat()) {
        newAreas.push(new google.maps.LatLngBounds(new google.maps.LatLng(prevNE.lat(), newSW.lng()), new google.maps.LatLng(newNE.lat(), newNE.lng())));
      }

      if (newAreas.length > 0) {
        const combinedBounds = new google.maps.LatLngBounds();
        newAreas.forEach(area => {
          combinedBounds.extend(area.getSouthWest());
          combinedBounds.extend(area.getNorthEast());
        });
        return combinedBounds;
      }

      return null;
    },
    showStationInfo(station, marker) {
      if (this.currentSelectedMarker) {
        this.updateMarkerIcon(this.currentSelectedMarker, false);
      }
      this.updateMarkerIcon(marker, true);
      this.stationInfo = {
        name: station.name,
        details: `Lat: ${station.latitude}, Lng: ${station.longitude}`,
      };
      this.stationInfoVisible = true;
      this.currentSelectedMarker = marker;
    },
    closeStationInfo() {
      if (this.currentSelectedMarker) {
        this.updateMarkerIcon(this.currentSelectedMarker, false);
        this.currentSelectedMarker = null;
      }
      this.stationInfoVisible = false;
    },
    updateTitle() {
      this.$emit('update-title', "Station Map");
    }
  },
  watch: {
    '$route.params': {
      handler(newParams) {
        const lat = newParams.lat ? parseFloat(newParams.lat) : this.defaultCenter.lat;
        const lon = newParams.lon ? parseFloat(newParams.lon) : this.defaultCenter.lng;
        const zoom = newParams.zoom ? parseInt(newParams.zoom) : this.defaultZoom;

        this.center = { lat, lng: lon };
        this.zoom = zoom;

        // If URL params change, update the map
        if (this.map) {
          this.map.setCenter(this.center);
          this.map.setZoom(this.zoom);
        }
      },
      immediate: true,
    },
  },
  mounted() {
    const lat = this.lat ? parseFloat(this.lat) : this.defaultCenter.lat;
    const lon = this.lon ? parseFloat(this.lon) : this.defaultCenter.lng;
    const zoom = this.zoom ? parseInt(this.zoom) : this.defaultZoom;

    console.log(lat, lon, zoom);

    this.center = { lat, lng: lon };
    this.zoom = zoom;

    this.updateTitle();

    this.requestor = new Requestor();
    this.loadGoogleMapsScript().then(() => {
      this.initMap();
    });
  },
};
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100vh;
  position: relative;
}
#station-info {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: white;
  padding: 10px;
  border: 1px solid black;
  display: none;
}
</style>
