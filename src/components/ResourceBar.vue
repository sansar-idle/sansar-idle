<!-- src/components/ResourceDisplay.vue -->
<template>
    <div class="resource">
        <div class="resource_name">{{ resource.name }}</div>
        <div class="resource_bar">
            <div class="resource_bar_fill" :style="{ width: barWidth }"></div>
        </div>
        <div class="resource_values">{{ resource.current }}/{{ resource.max }}</div>
    </div>
</template>

<script>
export default {
    props: {
        resource: Object,
    },
    computed: {
        barWidth() {
            return (this.resource.current / this.resource.max) * 100 + '%';
        },
    },
};
</script>

<style scoped>
.resource {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.resource_name {
    width: 100px;
}

.resource_bar {
    position: relative;
    width: 200px;
    height: 20px;
    background-color: #333;
    border: 1px solid #0f0;
    margin: 0 10px;
}

.resource_bar_fill {
    position: absolute;
    height: 100%;
    background-color: #0f0;
    transition: width 0.3s ease;
}

.resource_values {
    width: 80px;
    text-align: right;
}
</style>
