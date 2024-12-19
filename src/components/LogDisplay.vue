<template>
    <div class="log-window">
        <div v-for="log in logs" :key="log.message" :class="logClass(log.type)">
            <span>{{ log.message }}</span>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        logs: Array,
    },
    methods: {
        logClass(type) {
            switch (type) {
                case 'error':
                    return 'log log_fail';
                case 'success':
                    return 'log log_succeed';
                case 'system':
                    return 'log log_system';
                case 'flavor':
                default:
                    return 'log log_flavor';
            }
        },
    },
};
</script>
