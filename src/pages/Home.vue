<template>
  <div>
    <!-- Page Heading -->
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Welcome to DeFiOptions</h1>
    </div>
    <!-- END Page Heading -->

    <p>Lorem ipsum</p>

    <p v-if="isUserConnected">
      <strong>Your current chain:</strong> {{getChainName}}
    </p>

    <p v-if="!isUserConnected">
      <strong>Please connect your Ethereum wallet.</strong>

      <br>

      <button type="button" class="btn btn-success mt-3" @click="connectWeb3Modal">Connect wallet</button>
    </p>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Home",
  computed: {
    ...mapGetters("accounts", ["getChainName", "isUserConnected"]),
  },
  created() {
    this.$store.dispatch("accounts/initWeb3Modal");
    this.$store.dispatch("accounts/ethereumListener");
  },
  methods: {
    ...mapActions("accounts", ["connectWeb3Modal"]),
  }
}
</script>
