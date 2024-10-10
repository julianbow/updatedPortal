<template>
  <div>
    <Loader :isLoading="isLoading" />
    <div class="map-container" ref="mapContainer"></div>
  </div>
</template>

<script>
import { apiKeyGoogle } from '../../config.json';
import Requestor from '@/helpers/Requestor';
import Loader from '../components/Loader.vue';
import locationMarker from '@/assets/images/location-marker-3x.webp';
import locationMarkerGrow from '@/assets/images/location-marker-grow-3x.webp';

export default {
  components: {
      Loader,
    },
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
      isLoading: false,
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
        streetViewControl: false,
        mapId: "1a765d8eadff1159"
      });

      google.maps.event.addListener(this.map, 'idle', () => {
        this.getStations();
        this.updateRouteWithMapPosition();
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
      const bounds = this.map.getBounds();
      const newBounds = this.calculateNewBounds(bounds);

      this.isLoading = true;

      try {
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
            this.previousBounds = this.mergeBounds(this.previousBounds, bounds);
          }
        }
      } catch (error) {
        console.error("Error getting stations:", error);
      } finally {
        this.isLoading = false;
      }
    },

    calculateNewBounds(currentBounds) {
      if (!this.previousBounds) return currentBounds;

      const newSW = currentBounds.getSouthWest();
      const prevSW = this.previousBounds.getSouthWest();
      const newNE = currentBounds.getNorthEast();
      const prevNE = this.previousBounds.getNorthEast();

      const newAreas = [];

      if (newSW.lng() < prevSW.lng()) {
        newAreas.push(new google.maps.LatLngBounds(
          new google.maps.LatLng(newSW.lat(), newSW.lng()),
          new google.maps.LatLng(newNE.lat(), prevSW.lng())
        ));
      }

      if (newNE.lng() > prevNE.lng()) {
        newAreas.push(new google.maps.LatLngBounds(
          new google.maps.LatLng(newSW.lat(), prevNE.lng()),
          new google.maps.LatLng(newNE.lat(), newNE.lng())
        ));
      }

      if (newSW.lat() < prevSW.lat()) {
        newAreas.push(new google.maps.LatLngBounds(
          new google.maps.LatLng(newSW.lat(), newSW.lng()),
          new google.maps.LatLng(prevSW.lat(), newNE.lng())
        ));
      }

      if (newNE.lat() > prevNE.lat()) {
        newAreas.push(new google.maps.LatLngBounds(
          new google.maps.LatLng(prevNE.lat(), newSW.lng()),
          new google.maps.LatLng(newNE.lat(), newNE.lng())
        ));
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

    mergeBounds(prevBounds, newBounds) {
      if (!prevBounds) return newBounds;
      const mergedBounds = new google.maps.LatLngBounds();
      mergedBounds.extend(prevBounds.getSouthWest());
      mergedBounds.extend(prevBounds.getNorthEast());
      mergedBounds.extend(newBounds.getSouthWest());
      mergedBounds.extend(newBounds.getNorthEast());
      return mergedBounds;
    },

    addMarkers(stations) {
      this.clearMarkers();

      const infoWindow = new google.maps.InfoWindow();

      stations.forEach((station) => {
        const position = { lat: station.latitude, lng: station.longitude };

        const customIcon = {
          url: locationMarker,
          scaledSize: new google.maps.Size(33, 42),
          anchor: new google.maps.Point(14, 35)
        };

        const marker = new google.maps.Marker({
          position,
          map: this.map,
          icon: customIcon,
          title: station.name,
        });

        marker.addListener('click', () => {
          this.showStationInfo(station, marker, infoWindow);
        });

        this.markers.push(marker);
      });
    },

    clearMarkers() {
      this.markers.forEach(marker => marker.map = null);
      this.markers = [];
    },

    showStationInfo(station, marker, infoWindow) {
      marker.setIcon({
        url: locationMarkerGrow,
        scaledSize: new google.maps.Size(33, 42),
			  anchor: new google.maps.Point(14, 35)
      });

      const content = `
        <div>
          <h2>${station.name}</h2>
          <p>Lat: ${station.latitude}, Lng: ${station.longitude}</p>
          <p>Click for more details.</p>
        </div>
      `;

      infoWindow.setContent(content);
      infoWindow.open(this.map, marker);

      google.maps.event.addListener(infoWindow, 'closeclick', () => {
        marker.setIcon({
          url: locationMarker,
          scaledSize: new google.maps.Size(33, 42),
          anchor: new google.maps.Point(14, 35)
        });
      });

      this.currentSelectedMarker = marker;

      this.stationInfo = {
        name: station.name,
        details: `Lat: ${station.latitude}, Lng: ${station.longitude}`,
      };
      this.stationInfoVisible = true;
    },

    closeStationInfo() {
      if (this.currentSelectedMarker) {
        this.updateMarkerElement(this.currentSelectedMarker, false);
        this.currentSelectedMarker = null;
      }
      this.stationInfoVisible = false;
    },

    updateTitle() {
      this.$emit('update-title', "Station Map");
    }
  },
  mounted() {
    const lat = this.$route.params.lat ? parseFloat(this.$route.params.lat) : this.defaultCenter.lat;
    const lon = this.$route.params.lon ? parseFloat(this.$route.params.lon) : this.defaultCenter.lng;
    const zoom = this.$route.params.zoom ? parseInt(this.$route.params.zoom) : this.defaultZoom;

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
}
</style>
