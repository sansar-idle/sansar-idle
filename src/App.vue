<template>
    <div class="main-container">
      <!-- Top Bar -->
      <header class="top-bar">
        <div class="game-title">SANSAR Idle</div>
        <div class="top-right">
          <div class="settings-buttons">
            <button @click="exportToClipboard">Export</button>
            <button @click="openImportPopup">Import</button>
            <button @click="wipeGame">Wipe</button>
          </div>
          <span class="version-emblem">{{ version }}</span>
        </div>
      </header>
  
      <!-- Left Column -->
      <aside class="left-column">
        <h2>Resources</h2>
        <ResourceBar
          v-for="resource in resourcesStore.resources"
          :key="resource.id"
          :resource="resource"
        />
      </aside>
  
      <!-- Center Column -->
      <main class="center-column">
        <div class="center-top-row">
          <a href="#" class="menu-link">Orbital Mirror</a>
        </div>
  
        <div class="viewscape">
          <!-- <GenerateButton
            v-for="resource in resourcesStore.resources"
            :key="resource.id"
            :resource="resource"
            :consumeAmount="10"
            :logs="logs"
            :lastAlertTime="lastAlertTime"
          /> -->
          <Mirror />
        </div>
      </main>
  
      <!-- Right Column -->
      <aside class="right-column">
        <h2>Logs</h2>
        <LogDisplay :logs="logs" />
      </aside>
  
      <!-- Import Popup -->
      <div v-if="showImportPopup" class="import-popup">
        <div class="popup-content">
          <h3>Import Save Data</h3>
          <textarea v-model="importData" placeholder="Paste your save data here"></textarea>
          <div class="popup-buttons">
            <button @click="applyImport">Apply</button>
            <button @click="closeImportPopup">Close</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
<script>
  import { onMounted, reactive, ref } from 'vue';
  import { useResourcesStore } from './stores/resources';
  import { useUpgradesStore } from './stores/upgrades';
  import ResourceBar from './components/ResourceBar.vue';
  import LogDisplay from './components/LogDisplay.vue';
  import GenerateButton from './components/GenerateButton.vue';
  import Mirror from './components/Mirror.vue';
  import Tooltip from "./components/Tooltip.vue";
  
  export default {
    components: { ResourceBar, LogDisplay, GenerateButton, Mirror },
    setup() {
      const resourcesStore = useResourcesStore();
      const upgradesStore = useUpgradesStore();
      const logs = reactive([]);
      const lastAlertTime = reactive({});
      const showImportPopup = ref(false);
      const importData = ref('');
      const version = "v0.0.1";
  
      // Export to clipboard
      function exportToClipboard() {
        const saveData = {
          resources: resourcesStore.resources,
          upgrades: upgradesStore.upgrades,
        };
        navigator.clipboard.writeText(JSON.stringify(saveData)).then(() => {
          logs.unshift({ type: 'system', message: 'Save data copied to clipboard.' });
        }).catch(err => {
          alert('Failed to copy save data to clipboard.');
        });
      }
  
      // Open import popup
      function openImportPopup() {
        showImportPopup.value = true;
        importData.value = '';
      }
  
      // Close import popup
      function closeImportPopup() {
        showImportPopup.value = false;
      }
  
      // Apply imported data
      function applyImport() {
        try {
          const parsedData = JSON.parse(importData.value);
          if (parsedData.resources && parsedData.upgrades) {
            resourcesStore.fromJSON(JSON.stringify(parsedData.resources));
            upgradesStore.fromJSON(JSON.stringify(parsedData.upgrades));
            logs.unshift({ type: 'system', message: 'Save data imported successfully.' });
            closeImportPopup();
            window.location.reload(); // Refresh the page
          } else {
            throw new Error('Invalid save data format');
          }
        } catch (e) {
          alert('Invalid save data. Please check and try again.');
        }
      }
  
      // Wipe game data
      function wipeGame() {
        // if (confirm('Are you sure you want to wipe all data?')) {
            resourcesStore.reset();
            upgradesStore.reset();
            window.location.reload(); // Refresh the page
        //   alert('Game data wiped!');
        // }
      }

  
      onMounted(() => {
        logs.unshift({ type: 'system', message: 'Game initialized.' });
      });
  
      return {
        logs,
        resourcesStore,
        upgradesStore,
        exportToClipboard,
        openImportPopup,
        closeImportPopup,
        applyImport,
        wipeGame,
        showImportPopup,
        importData,
        lastAlertTime,
        version,
      };
    },
  };
</script>

  
  <style scoped>
  .settings-buttons {
    display: flex;
    gap: 5px;
  }
  
  button {
    background-color: #333;
    color: #aaa;
    border: none;
    padding: 5px 8px;
    font-size: 12px;
    cursor: pointer;
    border-radius: 3px;
  }
  
  button:hover {
    color: #fff;
    background-color: #555;
  }
  
  .version-emblem {
    margin-left: 15px;
    font-size: 10px;
    background-color: rgba(50, 50, 50, 0.8);
    color: rgba(200, 200, 200, 0.3);
    padding: 5px 8px;
    border-radius: 10px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
    display: inline-block;
    box-shadow: inset 1px 1px 2px rgba(255, 255, 255, 0.1), inset -1px -1px 2px rgba(0, 0, 0, 0.5);
  }
  
  .version-emblem:hover {
    color: rgba(200, 200, 200, 0.8);
  }
  
  .import-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #222;
    color: #fff;
    border: 1px solid #555;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    padding: 20px;
    z-index: 1000;
  }
  
  .popup-content {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
  
  textarea {
    width: 300px;
    height: 100px;
    padding: 10px;
    background-color: #333;
    color: #fff;
    border: 1px solid #555;
    border-radius: 4px;
    resize: none;
  }
  
  .popup-buttons {
    display: flex;
    gap: 10px;
  }
  </style>
  