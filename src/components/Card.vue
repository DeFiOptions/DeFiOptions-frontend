<template>
  <div class="card" :class="cardClass">
    <div class="card-body">
      <h5 class="card-title">{{title}}</h5>
      <p class="card-text">{{ text }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "Card",
  props: ["cardClass", "text", "title"]
}
</script>

<style>

</style>