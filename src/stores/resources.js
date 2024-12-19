// src/stores/resources.js
import { defineStore } from 'pinia';
import { reactive } from 'vue';

const defaultResources = [
  { id: 'r1', name: 'Photons', current: 0, max: 100 },
  // Add other resources here
  // { id: 'r2', name: 'Space Dust', current: 7, max: 100 },
];

export const useResourcesStore = defineStore('resources', {
  state: () => ({
    resources: reactive(JSON.parse(JSON.stringify(defaultResources))),
  }),
  persist: true, // This enables persistence
  getters: {
    getResourceById: (state) => (id) => {
      return state.resources.find((resource) => resource.id === id);
    },
  },
  actions: {
    incrementResource(id, amount = 1) {
      const resource = this.getResourceById(id);
      if (resource && resource.current + amount <= resource.max) {
        resource.current += amount;
      } else if (resource) {
        resource.current = resource.max; // Cap at max
      }
    },
    decrementResource(id, amount = 1) {
      const resource = this.getResourceById(id);
      if (resource && resource.current - amount >= 0) {
        resource.current -= amount;
      } else if (resource) {
        resource.current = 0; // Floor at 0
      }
    },
    setResourceCount(id, count) {
      const resource = this.getResourceById(id);
      if (resource) {
        resource.current = Math.min(Math.max(count, 0), resource.max);
      }
    },
    addResource(resource) {
      this.resources.push(resource);
    },
    removeResource(id) {
      this.resources = this.resources.filter((resource) => resource.id !== id);
    },
    // Export resources as JSON
    toJSON() {
      return JSON.stringify(this.resources);
    },
    // Import resources from JSON
    fromJSON(json) {
      try {
        const parsed = JSON.parse(json);
        if (
          Array.isArray(parsed) &&
          parsed.every(
            (res) => 'id' in res && 'name' in res && 'current' in res && 'max' in res
          )
        ) {
          this.resources = reactive(parsed);
        } else {
          throw new Error('Invalid save data');
        }
      } catch (e) {
        console.error('Failed to import resources:', e);
      }
    },
    // Reset resources
    reset() {
      this.resources = reactive(JSON.parse(JSON.stringify(defaultResources)));
    },
  },
});
