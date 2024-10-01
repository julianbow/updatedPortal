<template>
    <div class="loader" v-if="isLoading"></div>
</template>

  <script>
  export default {
    props: {
      isLoading: {
        type: Boolean,
        default: false
      }
    }
  }
  </script>

  <style scoped>
    .loader {
        border: 16px solid #f3f3f3;
        border-top: 16px solid #512b59;
        border-radius: 50%;
        width: 100px;
        height: 100px;
        animation: spin 2s linear infinite;
        position: absolute;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
  </style>
