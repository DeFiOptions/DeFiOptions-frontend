<template>
  <div>
    <div v-for="option in symbols" v-bind:key="option.symbol">
      <Option :option="option" :side="side" />
    </div>
  </div>
</template>

<script>
import Option from './Option.vue';

export default {
  name: "OptionsList",
  props: ["symbols", "side"],

  components: { 
    Option 
  },
}
</script>

<style>

</style>