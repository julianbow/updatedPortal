<template>
    <div id="qc-dashboard">
        <button class="button" @click="goBack">Back</button>
      <div class="tabs">
        <button
          :class="{ active: activeTab === 'tempest' }"
          @click="activeTab = 'tempest'">
          Tempest Data QC
        </button>
        <button
          :class="{ active: activeTab === 'cpo' }"
          @click="activeTab = 'cpo'">
          CPO QC
        </button>
      </div>

      <div class="tab-content">
        <TempestDataQC v-if="activeTab === 'tempest'" />
        <CPOQC v-else />
      </div>
    </div>
  </template>

  <script>
  import TempestDataQC from '@/components/qc/TempestDataQC.vue';
  import CPOQC from '@/components/qc/CPOQC.vue';

  export default {
    name: 'App',
    data() {
      return {
        activeTab: 'tempest' // default tab
      }
    },
    components: {
        CPOQC,
        TempestDataQC,
    },
    methods: {
        goBack() {
            this.$router.push({ name: 'tools' });
        },
        updateTitle() {
		  this.$emit("update-title", "QC Dashboard");
		},
    },
    mounted() {
		this.updateTitle();
	},
  }
  </script>

  <style scoped>
    #qc-dashboard {
        margin: 80px 20px;
        padding: 20px;
        background-color: #f9f9f9;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .tabs {
        display: flex;
        justify-content: center;
        border-bottom: 1px solid #ccc;
    }

    .tabs button {
        padding: 10px 20px;
        border: none;
        background: none;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        font-size: 16px;
    }

    .tabs button.active {
        border-bottom: 2px solid #333;
        font-weight: bold;
    }

    .tab-content {
        padding: 20px 0;
    }
  </style>
