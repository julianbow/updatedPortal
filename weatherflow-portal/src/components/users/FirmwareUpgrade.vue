<template>
    <div v-if="showDialog" class="modal-ctn">
      <div class="modal-content">
        <a href="#" class="modal-close" @click="closeDialog"></a>
        <h2 class="firmware-upgrade-name">{{ serialNumber }}</h2>
        <div class="firmware-upgrade-content">
          <div class="firmware-upgrade-choices-ctn" v-if="showChoices">
            <p>To upgrade, select a Firmware Revision.</p>
            <table class="firmware-upgrade-choices">
              <thead>
                <tr>
                  <th class="production-ready-col"></th>
                  <th colspan="1">Firmware Revision</th>

                  <th colspan="1">Release Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="firm in firmwareList" :key="firm.firmware_id">
                  <td v-if="firm.production_ready" class="production-ready" title="Production Ready"></td>
                  <td>{{ firm.firmware_revision }}</td>
                  <td>
                    <button class="btn" @click="upgradeFirmware(firm.firmware_revision, firm.firmware_id)">Upgrade</button>
                  </td>
                  <td>{{ firm.release_notes || '' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="firmware-upgrade-feedback" v-if="showProgress">
            <p class="firmware-upgrade-text">{{ upgradeText }}</p>
            <p class="firmware-upgrade-status-msg">{{ statusMessage }}</p>
            <div class="progress-bar-ctn">
              <div class="progress-bar" :style="{ width: progress + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script>
  export default {
    props: {
      requestor: Object,
    },
    data() {
      return {
        serialNumber: '',
        firmwareList: [],
        progress: 0,
        statusMessage: '',
        upgradeText: '',
        showDialog: false,
        showChoices: true,
        showProgress: false,
        socket: null,
      };
    },
    methods: {
      openDialog(serialNumber, currentFirmware) {
        this.serialNumber = serialNumber;
        this.getFirmwareRevisions(serialNumber, currentFirmware);
        this.showDialog = true;
      },
      closeDialog() {
        this.showDialog = false;
      },
      async getFirmwareRevisions(serialNumber, currentFirmware) {
        const urlData = { serial_number: serialNumber };

        const response = await this.requestor.makeGetRequest("firmware_set_safe_for_device", urlData);

        try {
            if (response.data.status.status_code === 0 && response.data.firmware) {
                this.firmwareList = response.data.firmware.filter(
                    (firm) => firm.firmware_revision >= currentFirmware
                );
            }
        } catch (error) {
            console.error("Error fetching firmware revisions:", error);
        }
      },
      upgradeFirmware(firmwareRevision, firmwareId) {
        const confirmUpdate = confirm(
          `Do you want to update ${this.serialNumber} to firmware revision ${firmwareRevision}?`
        );
        if (confirmUpdate) {
          this.createSocket();
          this.upgradeText = `Upgrading to firmware revision ${firmwareRevision}`;
          setTimeout(() => {
            this.setPendingFirmware(this.serialNumber, firmwareId);
            this.showUpgradeProgress();
          }, 300);
        }
      },
      async setPendingFirmware(serialNumber, firmwareId) {
        const urlData = {
          serial_number: serialNumber,
          pending_firmware_revision_id: firmwareId,
        };

        const response = await this.requestor.makeGetRequest("firmware_set_pending_id", urlData);
        try {
            if (response.data.status_code === 0) {
                const updateData = { serial_number: serialNumber };
                this.requestor.makeGetRequestWithNoAPIKey(
                    "firmware_send_update_command",
                    updateData
                );
            }
        } catch (error) {
            console.error("Error setting pending firmware:", error);
        }
      },
      showUpgradeProgress() {
        this.showChoices = false;
        this.showProgress = true;
      },
      createSocket() {
        const self = this;
        this.socket = new WebSocket("wss://swd.weatherflow.com/swd/data?api_key=2bab16fe-18a5-45f5-a8ec-1087420a347e");

        this.socket.onopen = () => {
          self.socket.send("firehose_pubsub_start");
          console.log("SOCKET OPENED");
        };

        this.socket.onclose = () => {
          console.log("SOCKET CLOSED");
        };

        this.socket.onerror = () => {
          console.log("SOCKET ERROR");
        };

        this.socket.onmessage = (e) => {
          const msg = JSON.parse(e.data);
          const latestFWMsg = "already at latest version";

          if (msg.serial_number && msg.type === "fw_update_status") {
            if (msg.status) {
              this.statusMessage = msg.status;
              if (msg.status.toLowerCase() === latestFWMsg || msg.status.toLowerCase() === "failed") {
                this.socket.close();
              }
            }
            if (msg.progress !== undefined) {
              this.progress = msg.progress;
              if (msg.progress === 100) {
                this.progress = 100;
              }
            }
          }
        };
      },
    },
  };
  </script>