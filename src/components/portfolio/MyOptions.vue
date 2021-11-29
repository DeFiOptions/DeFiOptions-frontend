<template>
  <div class="section-big row mt-4 mx-3">
    <h3>My options</h3>

    <div class="form-check form-switch mt-1 mx-3">
      <input 
        class="form-check-input" 
        type="checkbox" 
        role="switch" 
        id="expiredOptionsSwitch" 
        :checked="showExpired" 
        @click="toggleExpired"
      >
      <label class="form-check-label sell-text" for="expiredOptionsSwitch">
        Show expired options
      </label>
    </div>

    <div v-for="option in filteredUserOptions" v-bind:key="option.symbol">
      <MyOption :option="option" />
    </div>
    
  </div>
</template>

<script>
import MyOption from './MyOption.vue';

export default {
  name: "MyOptions",
  props: ["getUserOptions"],

  data() {
    return {
      showExpired: false
    }
  },

  computed: {
    filteredUserOptions() {
      if (this.showExpired === true) {
        return this.getUserOptions;
      }

      let filtered = [];

      for (let option of this.getUserOptions) {
        if (!this.isOptionExpired(option)) {
          filtered.push(option);
        }
      }

      return filtered;
    }
  },

  components: { 
    MyOption 
  },

  created() {
    const storedExpired = localStorage.getItem("showExpired"); // this returns a string, not a bool

    if (storedExpired === "true") {
      this.showExpired = true;
    } else {
      this.showExpired = false;
    }
  },

  methods: {
    isOptionExpired(option) {
      // only options that expired with intrinsic value 0 or less
      return (
        Math.floor(Date.now()/1000) > Number(option.timestamp) && 
        (Number(option.intrinsicValue)*Number(option.holding)).toFixed(0) <= 0
      );
    },

    toggleExpired() {
      this.showExpired = !this.showExpired;

      localStorage.setItem("showExpired", this.showExpired);
    }
  }
}
</script>

<style>

</style>