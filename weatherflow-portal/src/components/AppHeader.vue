<template>
    <header id="top-header">
        <div class="logo-container">
        <img src="../assets/images/tempest.svg" alt="Logo" class="logo" />
        </div>
        <h1>{{ title }}</h1>
    </header>
</template>

<script>
export default {
  name: 'AppHeader',
  props: {
    title: {
      type: String,
      required: true,
      default: 'Home'
    }
  }
};
</script>