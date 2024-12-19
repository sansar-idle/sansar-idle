<template>
    <div class="tooltip-wrapper" @mouseover="showTooltip" @mouseleave="hideTooltip">
      <slot></slot>
      <div
        class="tooltip-box"
        v-if="visible"
        :class="position"
        v-html="text"
      ></div>
    </div>
  </template>
  
  <script>
  export default {
    name: "Tooltip",
    props: {
      text: {
        type: String,
        required: true,
      },
      position: {
        type: String,
        default: "top", // Options: top, bottom, left, right
      },
    },
    data() {
      return {
        visible: false,
      };
    },
    methods: {
      showTooltip() {
        this.visible = true;
      },
      hideTooltip() {
        this.visible = false;
      },
    },
  };
  </script>
  
  <style scoped>
  .tooltip-box {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 10px;
  border-radius: 5px;
  width: 250px; /* Set a fixed width */
  white-space: normal;
  z-index: 10;
  font-size: 14px;
  text-align: center; /* Center-align text for a clean look */
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2); /* Add a subtle shadow for depth */
}

.tooltip-box.top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 10px;
}

.tooltip-box.bottom {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 10px;
}

.tooltip-box.left {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: 10px;
}

.tooltip-box.right {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 10px;
}

  </style>
  