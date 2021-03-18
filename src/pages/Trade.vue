<template>
  <div>
    <!-- Page Heading -->
    <div class="d-sm-flex align-items-center justify-content-between">
        <h1 class="h3 mb-0 text-gray-800">Trade</h1>
    </div>
    <!-- END Page Heading -->
  </div>
</template>


<script>
import { mapGetters } from "vuex";

export default {
  name: 'Trade',
  components: {
    
  },
  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getActiveBalanceEth", "getWeb3", "isUserConnected"]),
    ...mapGetters("liquidityPool", ["getSymbolsListJson"])
  },
  created() {
    if (!this.getWeb3 || !this.isUserConnected) {
      this.$router.push({ name: 'home'});
    }

    this.$store.dispatch("liquidityPool/fetchContract");
    this.$store.dispatch("liquidityPool/fetchSymbolsList");
  },
  data() {
    return {
      
    }
  },
  methods: {

  }
}
</script>
