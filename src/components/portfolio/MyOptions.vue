<template>
  <div class="section-big row mt-4 mx-3">
    <h3>My options</h3>

    <div v-for="option in getUserOptions" v-bind:key="option.symbol">
      <MyOption :option="option" />
    </div>

    
  </div>
</template>

<script>
import MyOption from './MyOption.vue';

export default {
  name: "MyOptions",
  props: ["getUserOptions"],

  components: { 
    MyOption 
  },
}
</script>

<style>

</style>