<template>
  <div class="card" :class="cardClass">
    <div class="card-body">
      <h5 class="card-title">
        {{title}}
        <i v-if="info" class="fas fa-info-circle" data-bs-toggle="tooltip" data-bs-placement="bottom" :title="info"></i>
      </h5>
      <p class="card-text">{{ text }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "Card",
  props: ["cardClass", "info", "text", "title"],

  mounted() {
    // enable tooltips
    let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new window.bootstrap.Tooltip(tooltipTriggerEl);
    });
  }
}
</script>

<style>

</style>