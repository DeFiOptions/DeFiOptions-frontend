<template>
  <div class="d-flex d-row">
    <div>
      <h3 :class="{grn:green}">{{title}}</h3>
      <p class="data-text" :class="{grn:green}">{{data}}</p>
    </div>

    <div v-if="divider" class="divider"></div>
  </div>
</template>

<script>
export default {
  name: "MyOptionDataItem",
  props: ["title", "data", "divider", "green"]
}
</script>

<style scoped>
.data-text {
  color: white;
  font-weight: 400;
  font-size: 20px;
}

.divider {
  position: static;
  width: 1px;
  height: 60px;
  background: #105685;
  margin-left: 20px;
  margin-right: 20px;
}

.grn {
  color: #5AFFB0;
}
</style>