<template>
  <div id="search-section">
    <input
      v-model="searchTerm"
      @keyup.enter="searchUsers"
      placeholder="Search users by email"
      id="search-box"
    />
    <div v-if="localSearchError" class="err-msg">
      {{ localSearchErrorMessage }}
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
      localSearchErrorMessage: '',
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

      // Prevent search if the search term is empty
      if (!this.searchTerm.trim()) {
        this.localSearchError = true;
        this.localSearchErrorMessage = "Search term cannot be empty.";
        return;
      }

      try {
        this.$emit('search', this.searchTerm);
      } catch (error) {
        this.localSearchError = true;
        this.localSearchErrorMessage = "Error searching users.";
      }
    },
  },
};
</script>