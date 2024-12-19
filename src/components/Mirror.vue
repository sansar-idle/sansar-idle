<template>
    <div class="mirror">
      <div class="slider-wrapper">
        <div class="blip-row">
          <div
            v-for="position in sliderPositions"
            :key="position"
            class="blip-col"
          >
            <!-- Dynamically added blips will be inserted here -->
            <div
              v-for="blip in blips.filter(b => b.position === position)"
              :key="blip.id"
              :class="['blip', blip.status]"
            ></div>
          </div>
        </div>
        <div class="aperture-row">
          <div
            v-for="position in sliderPositions"
            :key="position"
            class="aperture"
            :class="{ 
              'active-aperture': Math.abs(position - sliderPosition) <= lensWidth 
            }"
            :style="{ gridColumn: position + 1 }"
          ></div>
        </div>
        <div class="slider-row">
          <div
            class="bounding-box"
            v-for="position in sliderPositions"
            :key="position"
            :class="{
              'left': position === 0,
              'right': position === totalPositions - 1,
              'thumb-selected': Math.abs(position - sliderPosition) <= lensWidth,
              'selected': Math.abs(position - sliderPosition) <= lensWidth
            }"
            @click="handleBoxClick(position)"
          ></div>
          <!-- Dynamically create slider-thumb elements only for the claimed range -->
          <div
            v-for="position in sliderPositions.filter(pos => Math.abs(pos - sliderPosition) <= lensWidth)"
            :key="position"
            class="slider-thumb"
            :class="{
              'left': position === sliderPosition - lensWidth,
              'right': position === sliderPosition + lensWidth
            }"
            :style="{ gridColumn: position + 1 }"
          ></div>
        </div>
      </div>

        <div class="upgrade-list-horizontal">
            <div
                v-for="(upgrade, id) in upgradesStore.upgrades.mirror"
                :key="id"
                class="upgrade-item-horizontal"
            >
                <Tooltip
                :text="`
                    <h3>${upgrade.name}</h3>
                    <hr />
                    <i>${upgrade.description}</i>
                    <hr />
                    Level: ${upgrade.level}/${upgrade.maxLevel === Infinity ? '∞' : upgrade.maxLevel}<br />
                    Cost: ${upgrade.cost} ${upgrade.resource}
                `"
                position="bottom"
                >
                <button
                    :class="{
                    'disabled': resourcesStore.getResourceById('r1').current < upgrade.cost,
                    'maxed': upgrade.level >= upgrade.maxLevel,
                    'call-to-action': resourcesStore.getResourceById('r1').current >= upgrade.cost && upgrade.level < upgrade.maxLevel,
                    }"
                    @click="handleUpgradePurchase('mirror', id)"
                    :disabled="resourcesStore.getResourceById('r1').current < upgrade.cost || upgrade.level >= upgrade.maxLevel"
                >
                    {{ upgrade.button_name }}
                </button>
                </Tooltip>
            </div>
        </div>


    </div>
  </template>
  
  
<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useResourcesStore } from "../stores/resources";
import { useUpgradesStore } from "../stores/upgrades";
import Tooltip from "./Tooltip.vue";

export default {
  name: "Mirror",
  components: { Tooltip }, // Register Tooltip here
  setup() {

    const resourcesStore = useResourcesStore();
    const upgradesStore = useUpgradesStore();

    const totalPositions = 31;
    const sliderPosition = ref(Math.floor((totalPositions - 1) / 2));
    const lensWidth = computed(() => upgradesStore.upgrades.mirror.lens.level + 1); // Lens width is dynamic based on lens upgrade level
    const sliderPositions = Array.from({ length: totalPositions }, (_, i) => i);
    const blips = ref([]);
    const blipInterval = ref(null);
    const lastBlipPosition = ref(null);

    const startBlipGeneration = () => {
      if (blipInterval.value) {
        clearInterval(blipInterval.value); // Clear the existing interval
        blipInterval.value = null; // Ensure it's reset properly
      }

      const speedEffect = upgradesStore.upgrades.mirror.speed.effect;
      const speedLevel = upgradesStore.upgrades.mirror.speed.level;
      const interval = Math.max(2000 * Math.pow(speedEffect, speedLevel), 100); // Calculate interval based on speed effect

      const apertureEffect = upgradesStore.upgrades.mirror.aperture.level * upgradesStore.upgrades.mirror.aperture.effect + 1; // Determines number of photons per interval

      blipInterval.value = setInterval(() => {
        for (let i = 0; i < apertureEffect; i++) {
            setTimeout(() => {
                let newPosition = lastBlipPosition.value;

                if (newPosition === null) {
                newPosition = Math.floor(Math.random() * totalPositions);
                } else {
                const random = Math.random();
                if (newPosition === 0) {
                    // At the left wall
                    newPosition = random < 0.5 ? newPosition : newPosition + 1;
                } else if (newPosition === totalPositions - 1) {
                    // At the right wall
                    newPosition = random < 0.5 ? newPosition : newPosition - 1;
                } else {
                    // General case
                    if (random < 0.25) {
                    newPosition -= 1; // Move left
                    } else if (random < 0.5) {
                    newPosition += 1; // Move right
                    } // Otherwise stay in the same cell
                }
                }

                lastBlipPosition.value = newPosition;

                const isCaught = Math.abs(newPosition - sliderPosition.value) <= lensWidth.value;
                const blip = {
                id: Date.now() + i, // Ensure unique ID for each photon
                position: newPosition,
                status: isCaught ? "caught" : "missed",
                };

                blips.value.push(blip);

                if (isCaught) {
                resourcesStore.incrementResource("r1", 1);
                }

                setTimeout(() => {
                blips.value = blips.value.filter((b) => b.id !== blip.id);
                }, 500);
            }, Math.random() * interval); // Delays the generation of each photon
        }
      }, interval);
    };

    const handleBoxClick = (position) => {
        if (position - lensWidth.value < 0) {
        sliderPosition.value = lensWidth.value;
        } else if (position + lensWidth.value >= totalPositions) {
        sliderPosition.value = totalPositions - lensWidth.value - 1;
        } else {
        sliderPosition.value = position;
        }
    };


    const handleKeyPress = (event) => {
      if (event.key === "ArrowLeft" && sliderPosition.value - lensWidth.value > 0) {
        sliderPosition.value--;
      } else if (event.key === "ArrowRight" && sliderPosition.value + lensWidth.value < totalPositions - 1) {
        sliderPosition.value++;
      }
    };

    const handleUpgradePurchase = (stage, id) => {
  const cost = upgradesStore.purchaseUpgrade(stage, id, resourcesStore.getResourceById("r1").current);
  resourcesStore.decrementResource("r1", cost);

  // Adjust slider position if lens upgrade goes out of bounds
  if (stage === 'mirror' && id === 'lens') {
    const newLensWidth = upgradesStore.upgrades.mirror.lens.level + 1;
    if (sliderPosition.value - newLensWidth < 0) {
      sliderPosition.value = newLensWidth;
    } else if (sliderPosition.value + newLensWidth >= totalPositions) {
      sliderPosition.value = totalPositions - newLensWidth - 1;
    }
  }

  // Restart the interval regardless of the upgrade type
  startBlipGeneration();
};

    const isWithinLens = (position) => Math.abs(position - sliderPosition.value) <= lensWidth.value;

    // watch(
    //   () => [sliderPosition.value, lensWidth.value],
    //   () => {
    //     console.log('Updating lens display based on position and width');
    //   },
    //   { deep: true }
    // );

    onMounted(() => {
      startBlipGeneration();
      window.addEventListener("keydown", handleKeyPress);
    });

    onBeforeUnmount(() => {
      clearInterval(blipInterval.value);
      window.removeEventListener("keydown", handleKeyPress);
    });

    return {
      sliderPosition,
      totalPositions,
      sliderPositions,
      blips,
      handleBoxClick,
      upgradesStore,
      resourcesStore,
      handleUpgradePurchase,
      isWithinLens,
      lensWidth, // Ensure this is accessible to the template
    };
  },
};

</script>

<style scoped>
.mirror {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.slider-wrapper {
  display: grid;
  grid-template-rows: 50px 0px 50px;
  width: 400px; /* Fixed width for the entire slider */
  box-sizing: border-box; /* Prevent padding from affecting total width */
}

.aperture-row {
  display: grid;
  grid-template-columns: repeat(31, 1fr); /* Adjusted to match total positions */
  height: 0px;
}

.aperture {
  display: block;
  width: 100%;
  height: 30px;
}

.active-aperture {
  background: linear-gradient(to top, rgba(0, 255, 255, 0.8), rgba(0, 255, 255, 0) 75%);
  transform: translateY(-30px);
}

.blip-row {
  display: grid;
  grid-template-columns: repeat(31, 1fr); /* Matches slider-row */
  position: relative;
}

.blip-col {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.blip {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  animation: fade-out 0.5s forwards;
  position: absolute; /* Positioned relative to the parent column */
}

.blip.caught {
  background-color: yellow;
}

.blip.missed {
  background-color: white;
}

@keyframes fade-out {
  from {
    opacity: 1;
    transform: translateY(-30px) scale(0.8);
  }
  to {
    opacity: 0;
    transform: translateY(10px) scale(0.5);
  }
}

.slider-row {
  display: grid;
  grid-template-columns: repeat(31, 1fr); /* Dynamically adjusts to 31 columns */
  width: 100%; /* Ensures it uses the full container width */
  position: relative;
}

.bounding-box {
  width: 100%;
  height: 30px;
  background-color: rgba(0, 255, 0, 0.1);
  border-bottom: 2px solid rgba(0, 255, 0, 0.5);
  cursor: pointer;
}

.bounding-box.left {
  border-left: 2px solid rgba(0, 255, 0, 0.5);
}

.bounding-box.right {
  border-right: 2px solid rgba(0, 255, 0, 0.5);
}

.bounding-box.thumb-selected {
  border-bottom: none;
  background-color: rgba(0, 255, 0, 0.5);
}

.bounding-box.selected {
  background-color: rgba(0, 255, 0, 0.4);
}

.slider-thumb {
  width: 100%;
  height: 30px;
  background-color: rgba(0, 255, 0, 0.4);
  border-bottom: 2px solid rgba(0, 255, 0, 0.5);
  border-radius: 0; /* No rounded corners by default */
}

.slider-thumb.left {
  border-left: 2px solid rgba(0, 255, 0, 0.5);
  border-radius: 0 0 0 10px; /* Rounded bottom-left corner */
}

.slider-thumb.right {
  border-right: 2px solid rgba(0, 255, 0, 0.5);
  border-radius: 0 0 10px 0; /* Rounded bottom-right corner */
} 

.upgrade-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.upgrade-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.1);
  padding: 10px;
  border-radius: 5px;
}

.upgrade-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.upgrade-list-horizontal {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.upgrade-item-horizontal {
  position: relative;
}

button {
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  outline: none;
}

button.disabled {
  background-color: #555;
  color: #999;
  cursor: not-allowed;
}

button.maxed {
  background-color: gold;
  color: black;
}

button.call-to-action {
  background-color: green;
  color: white;
}

</style>