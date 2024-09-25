<template>
    <div id="search-section">
      <input
        v-model="searchTerm"
        @keyup.enter="searchUsers"
        placeholder="Search users by email"
        id="search-box"
      />
      <div v-if="localSearchError" class="err-msg">
        No users found.
      </div>
    </div>
  </template>

<script>
export default {
  name: "UserSearch",
  props: {
    searchError: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      searchTerm: '',
      localSearchError: this.searchError,
    };
  },
  watch: {
    searchError(newVal) {
      this.localSearchError = newVal;
    },
  },
  methods: {
    searchUsers() {
      this.localSearchError = false;
      try {
        this.$emit('search', this.searchTerm);
      } catch (error) {
        this.localSearchError = true;
      }
    },
  },
};
</script>
