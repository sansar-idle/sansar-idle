// src/stores/upgrades.js
import { defineStore } from 'pinia';
import { reactive } from 'vue';

const defaultUpgrades = {
  mirror: {
    speed: {
      name: 'Micromirror Adjustment',
      button_name: 'Increase Speed',
      description: 'Increase photon rate by ~35%.',
      level: 0,
      maxLevel: 10,
      cost: 10,
      effect: 0.7411, // ms reduction per level
      resource: "Photon",
    },
    aperture: {
      name: 'Aperture Width',
      button_name: 'Increase Count',
      description: 'Opens the aperture by a fraction, allowing more photons in.',
      level: 0,
      maxLevel: 10,
      cost: 20,
      effect: 1, // Additional photon streams per level
      resource: "Photon",
    },
    lens: {
      name: 'Focus Lens',
      button_name: 'Widen Lens',
      description: 'Focus the lens to increase the area of capture.',
      level: 0,
      maxLevel: 14,
      cost: 30,
      effect: 1, // Capture field columns per level
      resource: "Photon",
    },
  },
  // Future stages can be added here
};

export const useUpgradesStore = defineStore('upgrades', {
  state: () => ({
    upgrades: reactive(JSON.parse(JSON.stringify(defaultUpgrades))),
  }),
  persist: true, // This enables persistence
  actions: {
    purchaseUpgrade(stage, id, currentPhotons) {
      const upgrade = this.upgrades[stage][id];
      if (upgrade && upgrade.level < upgrade.maxLevel && currentPhotons >= upgrade.cost) {
        upgrade.level++;
        return upgrade.cost; // Photon cost to decrement from resources
      }
      return 0; // No cost deducted if purchase fails
    },
    getUpgradeEffect(stage, id) {
      const upgrade = this.upgrades[stage][id];
      return upgrade ? upgrade.effect * upgrade.level : 0;
    },
    toJSON() {
      return JSON.stringify(this.upgrades);
    },
    fromJSON(json) {
      try {
        const parsed = JSON.parse(json);
        if (typeof parsed === 'object' && parsed.mirror) {
          this.upgrades = reactive(parsed);
        } else {
          throw new Error('Invalid save data for upgrades');
        }
      } catch (e) {
        console.error('Failed to import upgrades:', e);
      }
    },
    reset(stage) {
      if (stage) {
        this.upgrades[stage] = reactive(JSON.parse(JSON.stringify(defaultUpgrades[stage])));
      } else {
        this.upgrades = reactive(JSON.parse(JSON.stringify(defaultUpgrades)));
      }
    },
  },
});
