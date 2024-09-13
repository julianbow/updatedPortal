<template>
    <div class="modal-ctn" v-if="isModalVisible">
        <div class="modal-content">
            <h2>{{ this.hardwareName }}</h2>
            <div class="hardware-type">
                <a class="modal-close" @click="hideModal"></a>
                <span :class="`${getHardwareImage()}`"></span>
            </div>
        </div>
    </div>
</template>

<script>
import "@/assets/css/modal.css";
export default {
  props: {
    hardwareType: Number,
    hardwareName: String,
  },
  data() {
    return {
      isModalVisible: false,
    };
  },
  methods: {
    showModal() {
      this.isModalVisible = true;
    },
    hideModal() {
      this.isModalVisible = false;
    },
    getHardwareImage() {
      switch(this.hardwareType) {
      case 0:
        return 'WF-HUB01';
      case 1:
        return 'WF-HUBP';
      case 2:
        return 'TH-HUB-01';
      case 3:
        return 'T1-HUB-01';
      case 4:
        return 'T1-HUBC';
      case 5:
        return 'T1-HUBC';
      }
    }
  }
}
</script>