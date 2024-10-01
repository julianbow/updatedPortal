<template>
    <div>

    </div>
</template>

<script>
import Requestor from '@/helpers/Requestor';

export default {
    data() {
        return {
            requestor: new Requestor(),
            metrics: null,
        };
    },
    methods: {
        async displayApplicationMenuGetData(){
            const response = await this.requestor.makeMetricsRequest();
            console.log(response);
        },
        updateTitle() {
            this.$emit('update-title', 'System Metrics');
        }
    },
    mounted() {
      this.updateTitle();
      this.displayApplicationMenuGetData()
    },
}
</script>