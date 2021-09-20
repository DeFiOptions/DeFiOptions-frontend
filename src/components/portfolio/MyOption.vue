<template>

<div class="section-small d-flex justify-content-between">

  <div class="d-flex justify-content-center">
    <MyOptionDataItem class="data-item" title="Option" :data="option.pair+' · ' + option.type" :divider="true" />
    <MyOptionDataItem class="data-item" title="Option size" :data="option.holding" :divider="true" />
    <MyOptionDataItem class="data-item" title="Expiration" :data="option.maturity" :divider="true" />
    <MyOptionDataItem class="data-item" title="Intrinsic value" :green="true" :data="'$'+(Number(option.intrinsicValue)*Number(option.holding)).toFixed(2)" />
  </div>

  <div>
    <button v-if="!isOptionExpired(option)" class="btn btn-success text-uppercase">Sell</button>
    <button v-if="isOptionExpired(option)" class="btn btn-success text-uppercase">Redeem</button>

    <span></span>
  </div>
  
</div>
  
</template>

<script>
import MyOptionDataItem from './MyOptionDataItem.vue';

export default {
  name: "MyOption",
  props: ["option"],

  components: { 
    MyOptionDataItem 
  },

  methods: {
    isOptionExpired(option) {
      return Math.floor(Date.now()/1000) > Number(option.timestamp);
    },
  }
}
</script>

<style>
.data-item {
  margin-right: 5px;
}

.section-small {
  margin-top: 16px;
}
</style>