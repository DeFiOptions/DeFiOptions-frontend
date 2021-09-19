<template>
  <div class="section-big row">
    <div class="col-md-3">
      <h3>Account balance</h3>

      <p>{{ exchangeBalance }}</p>
    </div>

    <div class="col-md-9">
      <h3>Withdraw</h3>
    </div>
  </div>
</template>

<script>
export default {
  name: "AccountBalance",
  props: ["exchangeBalance"]
}
</script>
