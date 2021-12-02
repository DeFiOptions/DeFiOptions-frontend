<template>
  <div class="d-flex d-row">
    <div>
      <h3 :class="{grn:green}">
        {{title}}
        <i v-if="info" class="fas fa-info-circle" data-bs-toggle="tooltip" data-bs-placement="bottom" :title="info"></i>
      </h3>
      <p class="data-text" :class="{grn:green}" v-if="data === 'loading'">
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      </p>
      <p v-if="data !== 'loading'" class="data-text" :class="{grn:green}">{{data}}</p>
    </div>

    <div v-if="divider" class="divider"></div>
  </div>
</template>

<script>
export default {
  name: "OptionDataItem",
  props: ["title", "data", "divider", "green", "info"],

  mounted() {
    // enable tooltips
    let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new window.bootstrap.Tooltip(tooltipTriggerEl);
    });
  },
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

/* Mobile screens */
@media screen and (max-width: 600px) {
  .divider {
    width: 0;
    height: 0;
  }
}
</style>