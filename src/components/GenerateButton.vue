<template>
    <div>
        <button class="generate_resource" @click="consumeResource">
            Consume 10 {{ resource.name }}
        </button>
    </div>
</template>

<script>
export default {
    props: {
        resource: Object,
        consumeAmount: Number,
    },
    methods: {
        consumeResource() {
            if (this.resource.current >= this.consumeAmount) {
                this.resource.current -= this.consumeAmount;
            } else {
                // Trigger red flash effect
                const resourceBar = document.querySelector(`#resource-bar-${this.resource.id}`);
                if (resourceBar) {
                    resourceBar.classList.add('resource-bar-error');
                    setTimeout(() => {
                        resourceBar.classList.remove('resource-bar-error');
                    }, 500); // Remove the class after 500ms
                }
            }
        },
    },
};
</script>
