<template>
    <h1>Tools</h1>
</template>

<script>
export default {
    data() {
        return {
            requestor: new Requestor(),
            metrics: null,
        };
    },
    methods: {
        updateTitle() {
            this.$emit('update-title', 'Tools');
        }
    },
    mounted() {
      this.updateTitle();
    },
};
</script>