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
import DataDisplay from '@/helpers/DataDisplay';
import locationMarker from '@/assets/images/location-marker-online.png';
import locationMarkerOffline from '@/assets/images/location-marker-offline.png';
import locationMarkerGrow from '@/assets/images/location-marker-grow-3x.webp';
import "@/assets/css/map.css";

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
        if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
          resolve();
        } else {
          const existingScript = document.getElementById('googleMapsScript');
          if (!existingScript) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKeyGoogle}`;
            script.async = true;
            script.defer = true;
            script.id = 'googleMapsScript';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          } else {
            existingScript.onload = resolve;
            existingScript.onerror = reject;
          }
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

      localStorage.setItem('mapLat', center.lat());
      localStorage.setItem('mapLon', center.lng());
      localStorage.setItem('mapZoom', zoom);

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
        const isOnline = station.location_status === 1;

        if (this.currentSelectedMarker && this.currentSelectedMarker.title === station.name) {
          return;
        }

        const icon = {
          url: isOnline ? locationMarker : locationMarkerOffline,
          scaledSize: new google.maps.Size(20, 20),
          anchor: new google.maps.Point(10, 20)
        };

        const marker = new google.maps.Marker({
          position,
          map: this.map,
          title: station.name,
          icon,
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

    async showStationInfo(station, marker, infoWindow) {
      if (this.currentSelectedMarker && this.currentSelectedMarker !== marker) {
        this.currentSelectedMarker.setIcon({
          url: this.currentSelectedMarker.getIcon().url,
          scaledSize: new google.maps.Size(20, 20),
          anchor: new google.maps.Point(10, 20)
        });
      }

      marker.setIcon({
        url: marker.getIcon().url,
        scaledSize: new google.maps.Size(30, 30),
        anchor: new google.maps.Point(15, 30)
      });

      const urlData = {
        report_name: "get_user",
        user_id: station.user_id
      };

      const response = await this.requestor.makePostRequest('report', urlData);

      try {
        if (response.data && response.status === 200) {
          const stations = response.data;
          const userId = station.user_id;

          stations.forEach((station) => {
            let content = `
              <div class="info-window">
                <div class="station-info">
                  <h2 class="station-name">
                    ${DataDisplay.getTempestWxLinkWithName(station.location_id, station.location_name)}
                  </h2>
                  <h3 class="station-email">
                    <a href='/users/${userId}'>${station.email_address}</a>
                  </h3>
                  <p class="station-location">Location: ${station.latitude}, ${station.longitude}</p>
                  <p class="station-elevation">Elevation: ${station.location_meta.elevation.toFixed(2)} meters</p>
                </div>

                <div class="devices-section">
                  <h4 class="devices-title">Devices</h4>
                  <ul class="devices-list">
            `;

            for (let x = 0; x < station.devices.length; x++) {
              let device = station.devices[x];

              if (device.device_type !== "HB" && device.serial_number !== null) {
                content += `
                  <li class="device-item">
                    <strong>Device Name:</strong> ${DataDisplay.getValue(device.device_meta.name)}<br />
                    <strong>Serial Number:</strong> ${DataDisplay.getSerialWithLogLink(device.serial_number)}<br />
                    <strong>Device ID:</strong> ${DataDisplay.getDeviceIdWithLink(device.v_device_id)}<br />
                    <strong>Type:</strong> ${device.device_type}<br />
                  </li>
                `;
              }
            }

            content += `
                  </ul>
                </div>
              </div>
            `;

            infoWindow.setContent(content);
            infoWindow.open(this.map, marker);
          });

          google.maps.event.addListener(infoWindow, 'closeclick', () => {
            marker.setIcon({
              url: marker.getIcon().url,
              scaledSize: new google.maps.Size(20, 20),
              anchor: new google.maps.Point(10, 20)
            });
          });

          // Update the current selected marker
          this.currentSelectedMarker = marker;
          this.stationInfoVisible = true;
        }
      } catch (error) {
        console.error("Error getting user:", error);
      }
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
    const storedLat = localStorage.getItem('mapLat');
    const storedLon = localStorage.getItem('mapLon');
    const storedZoom = localStorage.getItem('mapZoom');

    const lat = storedLat ? parseFloat(storedLat) : (this.$route.params.lat ? parseFloat(this.$route.params.lat) : this.defaultCenter.lat);
    const lng = storedLon ? parseFloat(storedLon) : (this.$route.params.lon ? parseFloat(this.$route.params.lon) : this.defaultCenter.lng);
    const zoom = storedZoom ? parseInt(storedZoom) : (this.$route.params.zoom ? parseInt(this.$route.params.zoom) : this.defaultZoom);

    this.center = { lat, lng };
    this.zoom = zoom;

    this.updateTitle();

    this.requestor = new Requestor();

    this.loadGoogleMapsScript()
      .then(() => {
        this.initMap();
      })
      .catch((error) => {
        console.error("Google Maps script could not be loaded:", error);
      });
  }
};
</script>